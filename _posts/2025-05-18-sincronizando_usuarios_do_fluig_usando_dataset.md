---
title: "Sincronizando usuários do Fluig usando Dataset"
description: "Como você mantém os usuários do Fluig sincronizados com o seu ERP? Vamos conferir como fazer isso com Dataset Jornalizado."
date: 2025-05-17 17:00:00 -0400
image:
  path: "/assets/img/2025-05-18-sincronizando_usuarios_do_fluig_usando_dataset/cover.jpg"
  alt: "Configurando o Postgresql no Fluig"
  hide: true
categories: fluig
tags:
  - fluig
  - dataset
  - TOTVS RM
---

O seu TOTVS Fluig é integrado com o seu ERP? Como você mantém a sincronização dos usuários
entre eles?

No meu vídeo eu compartilho como faço pro meu Fluig sincronizar os usuários com o nosso ERP
TOTVS Corpore RM usando o Serviço SOAP do RM e usando Dataset Jornalizado no Fluig, com
direito até a ter um log das ações do Fluig e avisando ao Suporte Técnico quando houver
falhas na sincronização, informando até as atividades pendentes do usuário que será
inativado.

{% include youtube.html id='88gi3zx3bzk' %}

Para auxiliar na análise do código demonstrado no vídeo vou postar aqui os principais trechos
dos códigos.

## Dataset Jornalizado

Esse é o código completo do Dataset que utilizo pra efetuar a sincronização.

```javascript
/**
 * Dataset que sincroniza os funcionários, estagiários e temporários
 * do Corpore RM com o Fluig.
 *
 * O controle automatizado é efetuado somente com esses três tipos de
 * usuário porque são os que devemos criar automaticamente no Fluig e,
 * quando deixam a empresa, devem ser inativados e ter suas tarefas
 * delegadas a outra pessoa.
 */

/**
 * Define a estrutura do Dataset
 */
function defineStructure() {
    addColumn("CODCOLIGADA", DatasetFieldType.NUMBER);
    addColumn("LOGIN", DatasetFieldType.STRING);
    addColumn("ACAO", DatasetFieldType.STRING);
    addColumn("DATA_EXECUCAO", DatasetFieldType.STRING);

    addIndex(["LOGIN", "ACAO", "DATA_EXECUCAO"]);
}

/**
 * Executa a sincronização de usuário
 *
 * @param {number} lastSyncDate Timestamp (em milisegundos) da última execução
 */
function onSync(lastSyncDate) {
    var dataset = DatasetBuilder.newDataset();

    var userService = fluigAPI.getUserService();
    var rmSqlService = getRmWsConsultaSqlService();
    var serverUrl = fluigAPI.getPageService().getServerURL();
    var mailRecipients = getErrorMailRecipients();

    /**
     * @type {java.util.Date}
     */
    var lastDayOnSync = null;

    if (lastSyncDate) {
        lastDayOnSync = new java.util.Date(lastSyncDate);
    } else {
        var calendar = java.util.Calendar.getInstance();
        calendar.add(java.util.Calendar.DAY_OF_MONTH, -2);
        lastDayOnSync = calendar.getTime();
    }

    var formatter = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    var lastSyncDateFormatted = formatter.format(lastDayOnSync);
    var todayDateFormatted = formatter.format(new java.util.Date());

    removeFiredEmployees(
        dataset,
        rmSqlService,
        userService,
        lastSyncDateFormatted,
        todayDateFormatted,
        mailRecipients,
        serverUrl
    );

    activateNewEmployees(
        dataset,
        rmSqlService,
        userService,
        lastSyncDateFormatted,
        todayDateFormatted,
        mailRecipients,
        serverUrl
    );

    return dataset;
}

/**
 * Sincroniza os usuários demitidos
 *
 * @param {Dataset} dataset
 * @param {IwsConsultaSQL} rmSqlService
 * @param {com.fluig.sdk.service.UserService} userService
 * @param {string} lastSyncDateFormatted
 * @param {string} todayDateFormatted
 * @param {java.util.ArrayList<string>} recipients
 * @param {string} serverUrl
 */
function removeFiredEmployees(
  dataset,
  rmSqlService,
  userService,
  lastSyncDateFormatted,
  todayDateFormatted,
  recipients,
  serverUrl
) {
    try {
        var result = rmSqlService.realizarConsultaSQL(
            "WSFluig.0019",
            getRmColigada(),
            "P",
            "DATA_D=" + lastSyncDateFormatted
        );

        var firedEmployees = (new XML(result)).Resultado;

        for (var i = 0, total = firedEmployees.length(); i < total; ++i) {
            var login = firedEmployees.LOGIN[i].toString();
            var fluigUser = getFluigUserByLogin(login);

            // Usuário não está no Fluig ou está inativo
            if (fluigUser.rowsCount == 0
                || fluigUser.getValue(0, "active") == "false"
                || fluigUser.getValue(0, "colleaguePK.colleagueId") == ""
            ) {
                continue;
            }

            try {
                userService.deactivateByCode(fluigUser.getValue(0, "colleaguePK.colleagueId"));

                dataset.addRow([
                    parseInt(firedEmployees.CODCOLIGADA[i].toString())
                    , login
                    , "INATIVADO"
                    , todayDateFormatted
                ]);
            } catch (error) {
                var errorMessage = sanitizeMessageError(error);
                var parameters = new java.util.HashMap();
                parameters.put("subject", "Fluig: Erro ao Inativar Usuário");
                parameters.put("SERVER_URL", serverUrl);
                parameters.put("TENANT_ID", getValue("WKCompany"));
                parameters.put("NOME", fluigUser.getValue(0, "colleagueName"));

                if (errorMessage == "Existem tarefas pendentes para esse usuário.") {
                    parameters.put(
                      "ATIVIDADES",
                      getPendingActivities(fluigUser.getValue(0, "colleaguePK.colleagueId"))
                    );

                    notifier.notify(
                      "admin",
                      "Sincroniza_Usuarios_Erro_Inativar_Pendencias",
                      parameters,
                      recipients,
                      "text/html"
                    );

                    continue;
                }

                parameters.put("ERRO", errorMessage);

                notifier.notify(
                  "admin",
                  "Sincroniza_Usuarios_Erro_Inativar",
                  parameters,
                  recipients,
                  "text/html"
                );
            }
        }
    } catch (error) {
        log.error(error);
    }
}

/**
 * Pega as atividades pendentes do usuário
 *
 * @param {string} colleagueId
 * @returns {java.util.ArrayList<string>}
 */
function getPendingActivities(colleagueId) {
    /**
     * @type {java.util.ArrayList<string>}
     */
    var pendingActivities = new java.util.ArrayList();

    /**
     * Cache para evitar consultas duplicadas
     *
     * @type {java.util.HashMap<string, string>}
     */
    var processesNames = new java.util.HashMap();

    var companyId = getValue("WKCompany");

    var pendingProcessesTasks = DatasetFactory.getDataset(
        "processTask",
        ["processTaskPK.processInstanceId"],
        [
            DatasetFactory.createConstraint(
              "processTaskPK.companyId",
              companyId,
              companyId,
              ConstraintType.MUST
            ),
            DatasetFactory.createConstraint(
              "processTaskPK.colleagueId",
              colleagueId,
              colleagueId,
              ConstraintType.MUST
            ),
            DatasetFactory.createConstraint(
              "status",
              0,
              0, ConstraintType.MUST
            )
        ],
        null
    );

    for (var i = 0; i < pendingProcessesTasks.rowsCount; ++i) {
        var processInstanceId = pendingProcessesTasks.getValue(i, "processTaskPK.processInstanceId");

        var process = DatasetFactory.getDataset(
            "workflowProcess",
            ["processId"],
            [
                DatasetFactory.createConstraint(
                  "workflowProcessPK.companyId",
                  companyId, companyId,
                  ConstraintType.MUST
                ),
                DatasetFactory.createConstraint(
                  "workflowProcessPK.processInstanceId",
                  processInstanceId,
                  processInstanceId, ConstraintType.MUST
                )
            ],
            null
        );

        var processId = process.getValue(0, "processId");

        if (!processesNames.containsKey(processId)) {
            processesNames.put(processId, getProcessName(processId));
        }

        pendingActivities.add(
          "Solicitação " + processInstanceId
          + ": " + processesNames.get(processId)
        );
    }

    return pendingActivities;
}

/**
 * Pega o nome do processo
 *
 * @param {string} processId
 * @returns {string}
 */
function getProcessName(processId) {
    var companyId = getValue("WKCompany");

    var processDefinition = DatasetFactory.getDataset(
        "processDefinition",
        ["processDescription"],
        [
            DatasetFactory.createConstraint(
              "processDefinitionPK.companyId",
              companyId,
              companyId,
              ConstraintType.MUST
            ),
            DatasetFactory.createConstraint(
              "processDefinitionPK.processId",
              processId,
              processId,
              ConstraintType.MUST
            )
        ],
        null
    );

    return processDefinition.getValue(0, "processDescription");
}

/**
 * Sincroniza os usuários recém contratados
 *
 * A consulta SQL retorna Grupo e Papel para o usuário, mas devido à facilidade de
 * trabalhar com Grupos no Fluig, enquanto Papel restringe muitas opções, optamos
 * por fazer com que o Papel seja também um Grupo. Desta forma os Papeis
 * "Funcionario" e "Estagiario" agora são os grupos com exatamente o mesmo código.
 *
 * @param {Dataset} dataset
 * @param {IwsConsultaSQL} rmSqlService
 * @param {com.fluig.sdk.service.UserService} userService
 * @param {string} lastSyncDateFormatted
 * @param {string} todayDateFormatted
 * @param {java.util.ArrayList<string>} recipients
 * @param {string} serverUrl
 */
function activateNewEmployees(
  dataset,
  rmSqlService,
  userService,
  lastSyncDateFormatted,
  todayDateFormatted,
  recipients,
  serverUrl
) {
    try {
        var result = rmSqlService.realizarConsultaSQL(
            "WSFluig.0020",
            getRmColigada(),
            "P",
            "DATA_D=" + lastSyncDateFormatted
        );

        var newEmployees = (new XML(result)).Resultado;

        for (var i = 0, total = newEmployees.length(); i < total; ++i) {
            var login = newEmployees.LOGIN[i].toString();
            var fluigUser = getFluigUserByLogin(login);

            /**
             * @type {string[]}
             */
            var groups = [];

            if (newEmployees.PAPEL[i].toString() != "") {
                groups.push(newEmployees.PAPEL[i].toString());
            }

            if (newEmployees.GRUPO[i].toString() != "") {
                groups.push(newEmployees.GRUPO[i].toString());
            }

            if (fluigUser.rowsCount == 0) {
                try {
                    createUser(
                        userService,
                        newEmployees.NOME[i].toString(),
                        newEmployees.EMAIL[i].toString(),
                        login,
                        groups
                    );

                    dataset.addRow([
                        parseInt(newEmployees.CODCOLIGADA[i].toString()),
                        login,
                        "CRIADO",
                        todayDateFormatted
                    ]);
                } catch (error) {
                    var errorMessage = sanitizeMessageError(error);

                    var parameters = new java.util.HashMap();
                    parameters.put("subject", "Fluig: Erro ao Criar Usuário");
                    parameters.put("SERVER_URL", serverUrl);
                    parameters.put("TENANT_ID", getValue("WKCompany"));
                    parameters.put("NOME", newEmployees.NOME[i].toString());
                    parameters.put("ERRO", errorMessage);

                    notifier.notify(
                      "admin",
                      "Sincroniza_Usuarios_Erro_Criar",
                      parameters,
                      recipients,
                      "text/html"
                    );
                }

                continue;
            }

            if (fluigUser.getValue(0, "active") == "true") {
                continue;
            }

            try {
                activateUser(
                    userService,
                    fluigUser.getValue(0, "colleaguePK.colleagueId"),
                    groups
                );

                dataset.addRow([
                    parseInt(newEmployees.CODCOLIGADA[i].toString())
                    , login
                    , "REATIVADO"
                    , todayDateFormatted
                ]);
            } catch (error) {
                var errorMessage = sanitizeMessageError(error);

                var parameters = new java.util.HashMap();
                parameters.put("subject", "Fluig: Erro ao Reativar Usuário");
                parameters.put("SERVER_URL", serverUrl);
                parameters.put("TENANT_ID", getValue("WKCompany"));
                parameters.put("NOME", fluigUser.getValue(0, "colleagueName"));
                parameters.put("ERRO", errorMessage);

                notifier.notify(
                  "admin",
                  "Sincroniza_Usuarios_Erro_Reativar",
                  parameters,
                  recipients,
                  "text/html"
              );
            }
        }
    } catch (error) {
        log.error(error);
    }
}

/**
 * Ativa usuário e insere no grupo e papel indicados
 *
 * @param {com.fluig.sdk.service.UserService} userService
 * @param {string} colleagueId
 * @param {string[]} groups
 */
function activateUser(userService, colleagueId, groups) {
    userService.activateByCode(colleagueId);
    var user = userService.findByUserCode(colleagueId);

    addUserInGroups(userService, user, groups);
}

/**
 * Cria usuário inserindo no grupo e papel indicados
 *
 * @param {com.fluig.sdk.service.UserService} userService
 * @param {string} name
 * @param {string} email
 * @param {string} login
 * @param {string[]} groups
 */
function createUser(userService, name, email, login, groups) {
    var firstNameSpaceIndex = name.indexOf(' ');
    var user = new com.fluig.sdk.user.UserVO();

    user.setCode(java.util.UUID.randomUUID().toString());
    user.setEmail(email);
    user.setLogin(login);
    user.setPassword(java.util.UUID.randomUUID().toString());
    user.setFirstName(name.substring(0, firstNameSpaceIndex));
    user.setLastName(name.substring(firstNameSpaceIndex + 1));
    user.setFullName(name);
    user.setIsActive(true);
    user = userService.create(user);

    addUserInGroups(userService, user, groups);
}

/**
 * Adiciona usuário aos grupos
 *
 * @param {com.fluig.sdk.service.UserService} userService
 * @param {com.fluig.sdk.user.UserVO} user
 * @param {string[]} groups
 */
function addUserInGroups(userService, user, groups) {
    for (var i = 0; i < groups.length; ++i) {
        userService.addUserToGroup(getValue("WKCompany"), groups[i], user);
    }
}

/**
 * Pega o usuário Fluig pelo login informado
 *
 * @param {string} login
 * @returns {Dataset}
 */
function getFluigUserByLogin(login) {
    return DatasetFactory.getDataset(
        "colleague",
        [
            "colleaguePK.colleagueId"
            , "login"
            , "colleagueName"
            , "active"
        ],
        [
            DatasetFactory.createConstraint("sqlLimit", 1, 1, ConstraintType.MUST),
            DatasetFactory.createConstraint(
              "colleaguePK.companyId",
              getValue("WKCompany"),
              getValue("WKCompany"),
              ConstraintType.MUST
            ),
            DatasetFactory.createConstraint("login", login, login, ConstraintType.SHOULD),
            DatasetFactory.createConstraint(
                "login",
                login + ".meudominio.com.br." + getValue("WKCompany"),
                login + ".meudominio.com.br." + getValue("WKCompany"),
                ConstraintType.SHOULD
            )
        ],
        null
    );
}

/**
 * Pega o serviço do WS
 *
 * @returns {IwsConsultaSQL}
 */
function getRmWsConsultaSqlService() {
    var credentials = getRmWebserviceUser();

    var serviceHelper = ServiceManager.getService("RM_CONSULTA_SQL").getBean();
    var service = serviceHelper.instantiate("com.totvs.WsConsultaSQL").getRMIwsConsultaSQL();

    return serviceHelper.getBasicAuthenticatedClient(
        service,
        "com.totvs.IwsConsultaSQL",
        credentials.username,
        credentials.password
    );
}

/**
 * Retorna o usuário do RM WebService
 *
 * @returns {{username: string, password: string}} Objeto com as propriedades username e password
 */
function getRmWebserviceUser() {
    var ds = DatasetFactory.getDataset(
        "ds_WebServiceUsers",
        null,
        [DatasetFactory.createConstraint('service', 'RM', 'RM', ConstraintType.MUST)],
        null
    );

    if (!ds.rowsCount) {
        throw "RM Webservice: Usuário não encontrado!";
    }

    return {
        username: ds.getValue(0, "wsUsername"),
        password: ds.getValue(0, "wsPassword")
    };
}

/**
 * Pega o Código da Coligada do RM para executar um WS
 *
 * @returns {number}
 */
 function getRmColigada() {
    var ds = DatasetFactory.getDataset(
        "ds_service_parameters",
        null,
        [
            DatasetFactory.createConstraint(
              "parametro",
              "RM_CODCOLIGADA",
              "RM_CODCOLIGADA",
              ConstraintType.MUST
            )
          ],
        null
    );

    if (!ds.rowsCount) {
        throw "RM_CODCOLIGADA não encontrada!";
    }

    return parseInt(ds.getValue(0, "valor"));
}

/**
 * Pega os destinatários para envio de e-mail sobre erros
 *
 * @returns {java.util.ArrayList<string>}
 */
function getErrorMailRecipients() {
    var recipients = new java.util.ArrayList();

    var users = DatasetFactory.getDataset(
        "ds_usuarios_ativos",
        ["mail"],
        [
          DatasetFactory.createConstraint(
            "groupId",
            "ServiceDesk",
            "ServiceDesk",
            ConstraintType.MUST
            )
          ],
        null
    );

    for (var i = 0; i < users.rowsCount; ++i) {
        recipients.add(users.getValue(i, "mail"));
    }

    return recipients;
}

/**
 * Remove a sujeira da mensagem de erro da exceção
 *
 * @param {{message: string}} error Exceção
 * @returns {string}
 */
function sanitizeMessageError(error) {
    return (new java.lang.String(error.message)).replaceAll("^.*Exception: (.*)$", "$1");
}
```

## Exemplo do Template de E-Mail que lista as atividades pendentes

```html
<html>
<head>
	<meta charset="utf-8">
    <title>Fluig</title>
</head>
<body>
    <p><img src="${SERVER_URL!''}/globalmailsender/mailSenderHeader?tenantId=${TENANT_ID!''}"></p>
    <p>
      Não foi possível inativar o usuário "<b>${NOME!''}</b>" no Fluig
      por possuir as seguintes atividades pendentes:
    </p>

    <ul>
        <#list ATIVIDADES as ATIVIDADE>
            <li>${ATIVIDADE}</li>
        </#list>
    </ul>
</body>
</html>
```

## Consultas SQL no RM

As consultas SQL seguem muito a regra de negócio que utilizo no meu trabalho, então não
julguei que colocá-las como exemplo seria muito benéfico.

Porém se entenderem que ela pode ajudar podem me avisar nos comentários do vídeo no YouTube
e assim vou compreender que elas seriam úteis.
