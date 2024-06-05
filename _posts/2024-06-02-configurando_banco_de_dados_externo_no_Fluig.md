---
title: "Configurando banco de dados externo no Fluig"
description: "Já precisou acessar um banco de dados externo no Fluig? Vamos ver um exemplo prático com Postgresql."
date: 2024-06-04 23:00:00 -0400
image:
  path: "/assets/img/2024-06-02-configurando_banco_de_dados_externo_no_Fluig/cover.jpg"
  alt: "Configurando o Postgresql no Fluig"
  hide: true
categories: fluig
tags:
  - fluig
  - banco de dados
  - postgresql
---

Em algumas situações pode ser necessário um acesso direto a um banco de dados externo.
Normalmente devido a algum sistema não possuir uma API ou até por questão de performance,
afinal é mais rápido executar um SELECT no banco dados.

Então para ajudar nessa etapa de configurar o banco de dados externo vou mostrar como fiz quando
precisei acessar um Postgresql no nosso Fluig on premise.

### Importante

Para efetuar as configurações a seguir é necessário ter acesso ao servidor do Fluig, pois vamos colocar
arquivos na sua pasta de instalação e alterar alguns arquivos de configuração.

E **é altamente recomendado** primeiro fazer as configurações em um ambiente de testes para evitar
surpresas desagradáveis.

## Baixando o driver JDBC

A primeira etapa é pegar o driver JDBC do banco de dados. No caso do Postregsql basta ir na
[Página de Download](https://jdbc.postgresql.org/download/) e baixar a versão de acordo com o
Fluig.

Quando fiz essa instalação eu baixei o arquivo `postgresql-42.2.20.jar`, mas aconselho a baixar a
versão mais atual.

Com o driver baixado é hora de ir para o servidor do Fluig e começar a configurar tudo.

## Instalando o driver

Para deixar mais simples a indicação das pastas vou considerar que estamos usando o Fluig num Windows Server
e que ele foi instalado em *C:\fluig*. Caso a sua instalação seja em outra pasta ou esteja usando Linux basta
trocar o *C:\fluig* pela pasta onde o seu Fluig foi instalado.

Vamos criar a pasta onde ficará salvo o driver JDBC. Ela deve ficar em: `C:\fluig\appserver\modules\system\layers\base\org\postgresql\main`.
Caso necessário vá criando as pastas até chegar na main.

Nesta pasta coloque o arquivo .jar baixado (no meu caso é o *postgresql-42.2.20.jar*) e então crie o arquivo
`module.xml` com o seguinte conteúdo:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<module xmlns="urn:jboss:module:1.1" name="org.postgresql">
  <resources>
    <resource-root path="postgresql-42.2.20.jar"/>
  </resources>
  <dependencies>
    <module name="javax.api"/>
    <module name="javax.transaction.api"/>
    <module name="javax.servlet.api" optional="true"/>
  </dependencies>
</module>
```

É muito importante que o atributo **path** da tag `resource-root` tenha o nome exato do arquivo .jar que foi salvo
na pasta.

## Configurando o acesso ao banco de dados

Todas as alterações a seguir serão feitas no arquivo **domain.xml**. Ele fica em `C:\fluig\appserver\domain\configuration\domain.xml`.

Neste arquivo de "domínio" vamos adicionar uma nova fonte de dados, que indica a conexão com o banco de dados, indicar
qual é o driver utilizado e onde está o módulo do driver JDBC.

Com o arquivo aberto em um editor procure a tag `<datasources>`, que estará dentro de `<subsystem xmlns="urn:jboss:domain:datasources:5.0">`.

A tag `<datasources>` possuí uma coleção de `<datasource>`, que é a configuração de acesso a um banco de dados, e
uma coleção de `<drivers>`, que é a indicação do módulo e driver utilizado para as conexões.

Repare que lá já temos as configurações de acesso ao banco de dados do próprio Fluig. Por algum motivo o Fluig possuí
3 configurações ao banco de dados.

Então vamos criar uma configuração para indicar o acesso ao Postgresql adicionando mais um `<datasource>` (pode ser antes da tag `<drivers>`):

```xml
<datasource
  enabled="true"
  jta="false"
  jndi-name="java:/jdbc/PostgreSqlDS"
  pool-name="PostgreSqlDS"
  use-java-context="false"
  use-ccm="false"
>
  <connection-url>jdbc:postgresql://host:porta/banco-de-dados</connection-url>
  <driver>postgresqlDriver</driver>
  <transaction-isolation>TRANSACTION_READ_COMMITTED</transaction-isolation>
  <pool>
    <min-pool-size>10</min-pool-size>
    <max-pool-size>100</max-pool-size>
    <prefill>true</prefill>
  </pool>
  <security>
    <user-name>usuário do banco</user-name>
    <password>senha do usuário do banco</password>
  </security>
  <statement>
    <prepared-statement-cache-size>32</prepared-statement-cache-size>
    <share-prepared-statements>false</share-prepared-statements>
  </statement>
  <validation>
    <validate-on-match>false</validate-on-match>
    <background-validation>false</background-validation>
  </validation>
</datasource>
```

Devemos prestar atençao em alguns pontos específicos do XML acima.

Na tag `<datasource>` temos os atributos **jndi-name** e **pool-name**. O **jndi-name** basicamente indica
o nome do seu datasource e é ele que usaremos no momento de indicar o banco de dados no qual conectaremos.
O Fluig padroniza colocar *DS* como sufixo no nome dos datasource (abreviação de **D**ata**S**ource).

Por indicarem o "nome" da conexão eu recomendo colocar um nome mais indicativo do que é a conexão. Por
exemplo, eu acesso o banco de um sistema chamado DocFlow, então nomeei como docflowDS.

Dentro de `<datasource>` temos a tag `<driver>`. Ela indica o nome do driver de conexão que usaremos.
Esse nome deve ser igual ao utilizado na coleção `<drivers>` que tem no final de `<datasources>`.
E é justamente agora que vamos criar uma entrada de driver nessa coleção, colocando **postgresqlDriver**
no atributo **name**, idêntico ao informado no `<datasource>`.

Então vamos adicionar a indicação do driver do Postgresql inserindo no final de `<drivers>`:

```xml
<driver name="postgresqlDriver" module="org.postgresql">
  <driver-class>org.postgresql.Driver</driver-class>
</driver>
```

E, finalmente, vamos adicionar o módulo do Postgresql como um módulo global.

Procure a tag `<subsystem xmlns="urn:jboss:domain:ee:4.0">` e no final dela insira esse código para criar um global-modules:

```xml
<global-modules>
  <module name="org.postgresql" slot="main"/>
</global-modules>
```

Tudo configurado, então é necessário reiniciar o Fluig.

## Configurando a conexão para o mesmo SGBD utilizado pelo Fluig

Caso você precise acessar outro servidor de banco de dados e ele seja do mesmo tipo utilizado no Fluig você
precisará simplesmente criar um `<datasource>` usando como modelo a configuração do **FluigDS**.

Simplesmente copie cole o `<datasource jta="true" jndi-name="java:/jdbc/FluigDS"` e altere o endereço
do servidor, nome do banco de dados, usuário e senha.

## Configurando uma conexão para um SGBD homologado

Caso você precise conectar em um banco de dados diferente do utilizado pelo Fluig, mas que seja um MySQL, SQL Server ou Oracle,
os 3 bancos homologados pelo Fluig, provavelmente não precisará da etapa de download do driver JDBC e da configuração
do módulo.

Não testei na prática (tá aí um ToDo pra mim), mas em teoria basta criar um `<datasource>` copiando o exemplo do Postgresql,
mas na tag `<driver>` do `<datasource>` indicar o driver do SGBD utilizado.

A seguir as tags `<driver>` de cada SGBD homologado para que você possa adicionar em `<drivers>`:

```xml
<!-- SQL Server -->
<driver name="sqlserverDriver" module="com.microsoft.sqlserver">
    <driver-class>com.microsoft.sqlserver.jdbc.SQLServerDriver</driver-class>
</driver>

<!-- MySQL -->
<driver name="mysqlDriver" module="com.mysql">
    <driver-class>com.mysql.cj.jdbc.Driver</driver-class>
</driver>

<!-- Oracle -->
<driver name="oracleDriver" module="com.oracle.jdbc">
    <driver-class>oracle.jdbc.driver.OracleDriver</driver-class>
</driver>
```

## Fazendo uma consulta ao banco de dados

Exemplo de utilização no DataSet:

```javascript
var myQuery = "SELECT * FROM minha_tabela";


try {
  var dataSource = "/jdbc/PostgreSqlDS"; // é o jndi-name sem o java:
  var ic = new javax.naming.InitialContext();
  var ds = ic.lookup(dataSource);
  var conn = ds.getConnection();
  var stmt = conn.createStatement();
  var rs = stmt.executeQuery(myQuery);

  var rsMeta = rs.getMetaData(); // o metadado é só pra preencher as colunas
  var columnCount = rsMeta.getColumnCount();

  var i;

  // Preenchendo automaticamente o nome das colunas do dataset
  for (i = 1; i <= columnCount; ++i) {
    dataset.addColumn(rsMeta.getColumnName(i));
  }

  while (rs.next()) {
    var row = [];

    for (i = 1; i <= columnCount; ++i) {
        row.push(rs.getString(i));
    }

    dataset.addRow(row);
  }
} catch (e) {
    log.error("ERRO==============> " + e.message);
} finally {
    // Importante sempre fechar os recursos abertos

    if (rs != null) {
      rs.close();
    }

    if (stmt != null) {
      stmt.close();
    }

    if (conn != null) {
      conn.close();
    }
}
```

## Lembre-se da Segurança

Os arquivos XML são texto plano, então qualquer pessoa com acesso ao servidor do Fluig pode visualizar as senhas
de todos os bancos configurados no domain.xml. Pensando nisso é importante ter muito cuidado com a segurança,
impedindo acesso não autorizado ao servidor.

O Fluig também oferece uma maneira de armazenar as senhas criptografadas no *domain.xml*.

Para aprender como configurar a criptografia das senha siga a documentação oficial:
[Encriptação de senha do banco de dados](https://tdn.totvs.com/pages/releaseview.action?pageId=454434362)
