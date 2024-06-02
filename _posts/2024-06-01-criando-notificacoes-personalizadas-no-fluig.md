---
title: "Criando notificações personalizadas no Fluig"
description: "Cansado de só enviar notificações por e-mail? Vamos aprender a criar notificações personalizadas no sistema."
date: 2024-06-01 15:00:00 -0400
image:
  path: "/assets/img/2024-06-01-criando-notificacoes-personalizadas-no-fluig/poster_post.jpg"
  alt: "Exemplo de notificação personalizada no Fluig"
  caption: "Criando notificações personalizadas no Fluig"
  hide: true
categories: fluig tutorial
tags:
  - fluig
  - desenvolvimento
  - java
  - javascript
---

Notificações personalizadas por e-mail são ótimas (utilizando o método `notifier.notify`), mas há situações nas
quais queremos que o alerta seja exibido no próprio Fluig, no ícone de notificações.

Tive essa necessidade de notificações no sistema durante o desenvolvimento de um processo para **Gestão de Frotas**,
pois não queria incomodar demais os gestores avisando sobre CNHs vencidas, afinal os motoristas já receberiam a
notificação por e-mail, então aos gestores era interessante simplesmente alertar que havia alguma coisa acontecendo.

Após muita pesquisa e testes consegui fazer essa *mágica* no Fluig e compartilho com você para que não sofra tanto
quanto eu.

## Como criar as notificações personalizadas

O Fluig não possuí, de forma simples, um modo de criar as notificações personalizadas. No máximo temos como configurar
quais são as notificações padrões dos novos usuários (no menu **Painel de Controle &rarr; Pessoas &rarr; Notificações padrões para novos usuários**).
No mesmo lugar que configuramos os processo de limpeza das notificações.

Os usuários também podem clicar no ícone de Notificações, ir em Configurações, e marcar quais notificações receberá por
e-mail, mas não é possível criar/modificar as permissões.

Felizmente o Fluig possuí métodos no WS REST que permite a criação das notificações personalizadas.

Basicamente temos que executar 2 processos para isso:

1. Criar um módulo de Notificações;
1. Criar os eventos de Notificação;

O módulo de notificações é como se fosse um agrupador dos tipos das notificações, enquanto os eventos indicam sobre o que
é a notificação disparada.

<img src="/assets/img/2024-06-01-criando-notificacoes-personalizadas-no-fluig/modulos_eventos_padrao.jpg" alt="Exemplo de Módulos e Eventos" style="max-width: 727px">

Para facilitar o processo de chamada ao REST farei isso nas **Ferramentas do desenvolvedor** no navegador, já autenticado no Fluig
com um usuário administrador.

No Chrome basta apertar `F12` ou `Ctrl + Shift + i` ou ir no menu *Mais ferramentas &rarr; Ferramentas do desenvolvedor*.
Quase todos os navegadores modernos possuem alguma ferramenta similar.

Com as Ferramentas do Desenvolvedor aberta temos que ir na aba `Console`, onde podemos digitar código JavaScript, para realizar
as chamadas ao Fluig.

Tudo isso é possível fazer por qualquer ferramenta de requisições (Postman, Thunder Client, etc.), porém executando no navegador
com usuário já autenticado não precisará se preocupar com a autenticação.

## Criando o módulo de Notificações Personalizadas

O endpoint `/api/public/alert/module/create` nos permite criar o módulo de notificações no Fluig.

Então, na aba Console da Ferramenta do desenvolvedor basta colar esse código e teclar Enter.

```javascript
fetch("/api/public/alert/module/create", {
    method: "POST",
    redirect: "follow",
    headers: {
        "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
        moduleKey: "PERSONALIZADAS",      // É o Código do Módulo que estamos criando
        descriptionKey: "Personalizadas"  // Descrição do Módulo
    }),
});
```

As propriedades `moduleKey` e `descriptionKey` identificam o código (como se fosse o userCode de um usuário)
do módulo e a sua descrição, respectivamente, então você pode colocar o nome que mais agradar.

Agora podemos acessar o endpoint `/api/public/alert/module/findVoList` para verificar se o módulo foi criado
e pegar o ID do módulo, pois precisaremos dele para adicionar os eventos.

No navegador, em uma aba que está com uma página do Fluig aberta, pode acessar a URL indicada.
Por exemplo: `https://meufluig.com.br/api/public/alert/module/findVoList`.

<img src="/assets/img/2024-06-01-criando-notificacoes-personalizadas-no-fluig/modulo_criado.jpg" alt="Módulo criado" style="max-width: 452px">

De posse dessa informação, que o ID é **36**, podemos criar os eventos.

## Criando os eventos de Notificações Personalizadas

O endpoint `/api/public/alert/event/createEvent` permite criar o evento de notificação. Então voltemos ao Console
da Ferramenta do Desenvolvedor, no Fluig com usuário autenticado, e basta colar o seguinte código:

```javascript
fetch("/api/public/alert/event/createEvent", {
    method: "POST",
    redirect: "follow",
    headers: {
        "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
        eventKey: "FROTA_CNH_VENCIDA", // Este Código é o que usaremos para disparar a notificação
        required: true,
        descriptionKey: "Frota: CNH Vencida",
        singleDescriptionKey: "A CNH está vencida.",
        groupDescriptionKey: "A CNH está vencida.",
        eventIcon: "/globalalertapi/resources/images/exclamation-sign.png",
        moduleId: 36, // Este é o ID do módulo que criamos
        grouped: false,
        canRemove: false,
        removeAfterExecAction: true,
        onlyAdmin: false,
    }),
});
```

Podemos conferir no painel de controle que agora aparece o módulo e evento criado. Aproveito para desmarcar o envio por e-mail,
pois é justamente um dos motivos pelo qual fiz a notificação personalizada. Caso deixe marcado o usuário também receberá um e-mail.

<img src="/assets/img/2024-06-01-criando-notificacoes-personalizadas-no-fluig/evento_criado.jpg" alt="Módulo criado" style="max-width: 756px">

## Disparando a Notificação

Para disparar a notificação é necessário que o código seja executado no back-end do Fluig. Isso pode ser feito em algum evento
ou criar um dataset para isso.

O código para disparar é bem simples. Vou demonstrar em um dataset.

```javascript
function createDataset(fields, constraints, sorts) {
    var dataset = DatasetBuilder.newDataset();
    dataset.addColumn("executado");

    var alertService = fluigAPI.getAlertService();

    var objeto = new com.totvs.technology.foundation.alert.GenericAlertObject(
        -1,
        "FROTA_CNH_VENCIDA",
        "O motorista XPTO foi notificado por e-mail que está com a CNH Vencida!",
        null,
        null,
        null
    );

    alertService.sendNotification(
        "FROTA_CNH_VENCIDA",
        null,
        "login de quem vai receber a notificação",
        objeto,
        null,
        null,
        null
    );

    return dataset;
}

```

E agora podemos ver a notificação disparada.

<img src="/assets/img/2024-06-01-criando-notificacoes-personalizadas-no-fluig/notificacao_disparada.jpg" alt="Módulo criado" style="max-width: 390px">

## Considerações Finais

A possibilidade de enviar notificações personalizadas auxilia muito em várias atividades, mas tenha cuidado para não
poluir demais os usuários com notificações e e-mails personalizados ao mesmo tempo.

Para quem estiver curioso de como utilizei na prática pode conferir esse [Gist](https://gist.github.com/brunogasparetto/a56010eaf4bf43e3d29b523ddca9ca0c#exemplo-pr%C3%A1tico). Nele eu demonstro o meu Dataset jornalizado que busca as CNHs inativas, dispara os
e-mails personalizados e notifica os gestores.
