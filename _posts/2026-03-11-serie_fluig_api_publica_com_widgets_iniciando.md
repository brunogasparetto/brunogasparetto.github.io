---
title: Série Fluig - API Pública com Widgets - Iniciando
description: Iniciando uma série de vídeos/posts sobre construção de API Pública com Widgets no TOTVS Fluig.
date: 2026-03-11 21:00:00 -0400
image:
  path: "/assets/img/2026-03-11-serie_fluig_api_publica_com_widgets_iniciando/cover.jpg"
  alt: "Fluig - API Pública com Widgets"
  hide: true
categories: fluig
tags:
  - fluig
  - widget
  - API
---

Já vi muitas dúvidas sobre como compartilhar dados do Fluig em um ambiente público e, pior ainda, vi muito mais
conselhos ruins para segurança da sua aplicação ao ensinar deixar suas credenciais disponíveis no navegador do
usuário.

Por isso resolvi criar essa série de vídeos explicando como podemos expor os dados, executando as APIs do Fluig
em uma página pública, porém sem deixar credenciais à vista.

{% include youtube.html id='E1iEzCDj9tY' %}

Deixarei aqui os exemplos dos arquivos que precisamos adicionar para configurar o projeto.

Código do `pom.xml`:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd"
>
  <artifactId>SimpleRestExample</artifactId>
  <name>SimpleRestExample</name>
  <description>Exemplo Simples de API REST pública no Fluig</description>
  <groupId>com.brunogasparetto</groupId>
  <version>0.1.0</version>

  <properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <dependencies>
    <dependency>
      <groupId>javax</groupId>
      <artifactId>javaee-api</artifactId>
      <version>8.0.1</version>
      <scope>provided</scope>
    </dependency>
    <dependency>
      <groupId>oauth.signpost</groupId>
      <artifactId>signpost-commonshttp4</artifactId>
      <version>2.1.1</version>
    </dependency>
    <dependency>
      <groupId>org.apache.httpcomponents</groupId>
      <artifactId>httpcore</artifactId>
      <version>4.4.16</version>
    </dependency>
    <dependency>
      <groupId>org.apache.httpcomponents</groupId>
      <artifactId>httpclient</artifactId>
      <version>4.5.14</version>
    </dependency>
  </dependencies>

  <modelVersion>4.0.0</modelVersion>
  <packaging>war</packaging>

  <build>
    <finalName>${project.artifactId}</finalName>

    <plugins>
      <plugin>
        <artifactId>maven-clean-plugin</artifactId>
        <version>3.4.1</version>
      </plugin>
      <plugin>
        <artifactId>maven-resources-plugin</artifactId>
        <version>3.3.1</version>
      </plugin>
      <plugin>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>3.5.2</version>
      </plugin>
      <plugin>
        <artifactId>maven-war-plugin</artifactId>
        <version>3.4.0</version>
      </plugin>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
        <version>3.14.0</version>
        <configuration>
          <source>11</source>
          <target>11</target>
        </configuration>
      </plugin>
    </plugins>
  </build>
</project>
```

Código do `beans.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://java.sun.com/xml/ns/javaee"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/beans_1_0.xsd">
</beans>
```
