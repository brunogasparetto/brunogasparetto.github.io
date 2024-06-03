---
title: "Configurando banco de dados externo no Fluig"
description: "Já precisou acessar um banco de dados externo no Fluig? Vamos ver um exemplo prático com Postgresql."
date: 2024-06-02 15:00:00 -0400
image:
  path: "/assets/img/2024-06-01-criando-notificacoes-personalizadas-no-fluig/poster_post.jpg"
  alt: "Exemplo de notificação personalizada no Fluig"
  hide: true
categories: fluig
tags:
  - fluig
  - desenvolvimento
  - java
  - javascript
  - banco de dados
  - postgresql
  - xml
---

Em algumas situações pode ser necessário que utilizemos acesso direto a algum banco de dados externo ao
Fluig. Normalmente devido a algum sistema não possuir uma API que permita consultar/alterar os dados ou
até mesmo por questão de performance, afinal pode ser muito mais rápido executar um SELECT no banco
dados ao invés de chamar uma API, pegar o resultado, converter e só então utilizar. Já tive esse
problema de performance ao consultar dados do TOTVS RM via SOAP.

Então para ajudar nessa etapa de como configurar o banco de dados externo vou mostrar como fiz quando
precisei fazer a configuração para acessar um banco Postgresql no nosso Fluig on premise.

**Importante**

Para efetuar as configurações a seguir é necessário ter acesso ao servidor do Fluig, pois vamos colocar
arquivos na sua pasta de instalação e alterar alguns arquivos de configuração.

## Baixando o driver JDBC

A primeira etapa é pegar o driver JDBC do banco de dados. No caso do Postregsql basta ir na
[Página de Download](https://jdbc.postgresql.org/download/) e baixar a versão de acordo com o
Fluig.

Quando fiz essa instalação eu estava utilizando o Fluig 1.7.0, então peguei o arquivo `postgresql-42.2.20.jar`.

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

As alterações a seguir serão feitas no arquivo "domain.xml" que está na pasta `<instalação do fluig>\appserver\domain\configuration`

Criar um novo datasource dentro de `<datasources>` em `<subsystem xmlns="urn:jboss:domain:datasources:5.0">`

As propriedades jndi-name (esse será o dataSource na consulta) e pool-name, do `<datasources>`, são importantes para
nomear a conexão que será feita no Dataset.

```xml
<datasource
  enabled="true"
  jta="false"
  jndi-name="java:/jdbc/PostgreSqlDS"
  pool-name="PostgreSqlDS"
  use-java-context="false"
  use-ccm="false"
>
  <connection-url>jdbc:postgresql://host-do-banco:porta/NOME-DA-BASE</connection-url>
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

Criar um novo driver dentro de `<drivers>` (ainda dentro de datasources):

```xml
<driver name="postgresqlDriver" module="org.postgresql">
  <driver-class>org.postgresql.Driver</driver-class>
</driver>
```

Em `<subsystem xmlns="urn:jboss:domain:ee:4.0">` deve-se criar um global-modules:

```xml
<global-modules>
  <module name="org.postgresql" slot="main"/>
</global-modules>
```

Reiniciar o Fluig.

Exemplo de utilização no DataSet:

```javascript
try {
  var dataSource = "/jdbc/PostgreSqlDS";
  var ic = new javax.naming.InitialContext();
  var ds = ic.lookup(dataSource);
  var conn = ds.getConnection();
  var stmt = conn.createStatement();
  var rs = stmt.executeQuery(myQuery);
  var rsMeta = rs.getMetaData();
  var columnCount = rsMeta.getColumnCount();

  var i = 0;

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

Sempre importante lembrar que o ideal é salvar as senhas de forma criptografada no Fluig.

Você pode seguir a orientação da documentação <https://tdn.totvs.com/pages/releaseview.action?pageId=454434362>

Fim.
