---
title: "Plugin de Anexos em Formulário no Processo do Fluig"
description: "Alguns processos demandam um maior cuidado com os anexos, validando eles em campos do formulário. Esse plugin JQuery ajuda nessa tarefa."
date: 2025-10-18 12:00:00 -0400
image:
  path: "/assets/img/2025-10-18-plugin_de_anexos_em_formulario_no_processo_do_fluig/cover.jpg"
  alt: "Como usar o Plugin de Anexos em Formulário"
  hide: true
categories: fluig
tags:
  - fluig
  - processos
  - workflow
  - anexos
  - jquery
---

Uma reclamação usual dos usuários do TOTVS Fluig é a dificuldade ao trabalhar com anexos dentro de um Processo. Esse problema se dá porque o Fluig tem
a mentalidade de trabalhar com anexos como se fosse um e-mail, simplesmente jogando-os no processo sem permitir um vínculo específico com algum campo
do formulário.

Essa forma de trabalhar com anexos dificulta a validação deles e, no caso de processos que precisam de vários anexos,
os usuários devem olhar anexo por anexo, muitas vezes com nomes que não informam corretamente o seu conteúdo, para entender o que cada documento é e,
só então, validar se estão corretos. Imagine então a situação na qual cada linha de uma Tabela Pai x Filho precisa de um anexo.

Fiz um vídeo mostrando opções para tratar o envio dos anexos, então pode dar uma olhada nele, mas também resolvi postar o básico por
aqui para facilitar para quem prefere ler a assistir vídeos.

{% include youtube.html id='pZgViYE4DA8' %}

## Regras Disponíveis na Plataforma e Seus Problemas

Ao editar o Workflow temos algumas opções de regras para anexo, tais como controlar a segurança dos anexos e até a obrigar que eles sejam inseridos
em determinada atividade.

Por exemplo, ao configurar as propriedades do Workflow, podemos ir na seção Segurança Anexos e indicar quem poderá inserir, anexar, editar etc., os
anexos. Essa configuração é feita usando Mecanismo de Atribuição. Porém vale ressaltar que essa configuração é global para o processo. Não é possível
configurar seguranças específicas para cada atividade (ao menos não da maneira padrão do Fluig).

<img src="/assets/img/2025-10-18-plugin_de_anexos_em_formulario_no_processo_do_fluig/seguranca_anexos.jpg" alt="Segurança dos Anexos" style="max-width: 881px">

Outra configuração que o editor de Workflow nos dá é a de obrigatoriedade de anexos em determinadas atividades. Com essa regra podemos informar a
quantidade de arquivos que são obrigatórios inserir na atividade, além de obrigar os arquivos por suas extensões e até informar a mensagem de erro
que será disparada quando as exigências não forem cumpridas.

<img src="/assets/img/2025-10-18-plugin_de_anexos_em_formulario_no_processo_do_fluig/regra_anexo.jpg" alt="Regras de Anexos" style="max-width: 783px">

Com as regras de anexo do Fluig podemos informar se é obrigatório inserir um anexo em determinada atividade, porém não há como colocar essa
regra dependendo da atividade seguinte. O que nos obriga a fazer validações nos eventos de processo para determinar se algum anexo foi inserido
em determinada atividade. Esse é um exemplo real que tenho em um processo.

<img src="/assets/img/2025-10-18-plugin_de_anexos_em_formulario_no_processo_do_fluig/regra_anexo_condicional.jpg" alt="Regra Condicional" style="max-width: 506px">

Na atividade "Elaborar Parecer Jurídico (1)" o Jurídico pode inserir um Parecer e então encaminhar para a atividade "Analisar Parecer Jurídico (2)",
na qual o Administrativo vai analisar o parecer emitido. Nessa situação é obrigatório que seja inserido o anexo "Parecer Jurídico" na atividade (1).
Porém o Jurídico pode demandar que um Estagiário elabore uma minuta, encaminhando para a atividade "Elaborar Minuta de Parecer Jurídico (3)", e
nessa situação não podemos obrigar um anexo na atividade (1), pois agora a obrigatoriedade recai nas atividades (3) e (4). Essa situação não é
possível usando as regras de anexo do editor de workflow, mas ainda é possível validar se houve anexo inserido na atividade usando evento de processo.

As regras da Segurança de Anexo e Regras de Anexo por atividade ajudam bastante em processos simples, mas infelizmente quantos processos simples
vocês desenvolvem no Fluig? E ainda temos o problema de ficarmos "perdidos" ao analisar os anexos de processos que exigem grande quantidade de documentos.

## As soluções da Comunidade

Para contornar essas limitações do Fluig os membros da comunidade de Devs Fluig tiveram algumas ideias muito boas. Elas consistem, basicamente,
em salvar no Formulário a informação do arquivo anexado. Assim pode-se validar se o campo com a informação está preenchido (obrigatoriedade),
e por estar organizado em campos do formulário os usuários sabem do que se trata cada anexo.

Conversando com desenvolvedores notei duas práticas:

1. Enviar o arquivo para o GED do Fluig usando a API;
2. Usar as opções de Upload de Anexo do Fluig de forma não usual;

A opção de enviar o arquivo para o GED do Fluig usando a API é muito boa, pois garante que os documentos serão agrupados em alguma pasta do GED,
além de ser mais simples usar e funciona bem também no Fluig Mobile (usando o app My Fluig).

É possível, em evento de processo, usar o método `hAPI.attachDocument` para vincular o arquivo do GED como anexo do Processo.
{: .bubble-note}

Usar as opções de Upload de Anexo do Fluig, de forma não usual, consiste em acessar os métodos JavaScript do Fluig pelo formulário e simular
que o usuário clicou no botão de anexar arquivos, e então efetuar o tratamento de salvar as informações após o envio do arquivo, salvando no formulário
as informações necessárias. Para essa opção o Sérgio Machado fez um componente incrível e o compartilhou no [GitHub](https://github.com/sergiomachadosilva/fluig-utils/tree/main/projetos/ComponenteAnexos), com direito a vídeo explicando como usar o componente.

A segunda opção de solução tem um grande problema: os usuários podem acessar a aba de anexos e excluir arquivos, deixando o processo falho,
pois no formulário teremos os campos com os valores preenchidos, mas na prática não temos mais o arquivo anexado ao processo. Tem ainda o problema
de depender da interface do Fluig e ela ser alterada sem aviso prévio com o lançamento de novas releases, além da dificuldade quando utilizando
o app My Fluig.

A primeira opção temos como vantagem que o arquivo está salvo no GED, então mesmo que seja anexado ao processo, se o usuário o remover ele ainda existirá
no GED e não corromperá o processo. Entretanto temos a dificuldade de que em todo processo será necessário fazer, em evento de processo, a tratativa
de anexar o arquivo ao processo.

## Plugin Fluig Form Attachment

Após estudar o componente criado pelo Sérgio Machado eu gostei da abordagem utilizada e resolvi desenvolver um plugin para facilitar a manipulação
dos anexos.

Entretanto, por utilizar a abordagem de usar os próprios métodos de anexo do Fluig, teremos o problema dos usuários conseguirem deletar/modificar os
arquivos na aba de anexos.

O que fiz como solução para esse problema foi radical: ocultar a aba de anexos.

Além disso, nos processos que preciso de muito controle sobre os anexos, eu não permito acesso pelo app My Fluig, pois nele não temos controle de
exibição da aba anexos e não poderia permitir a manipulação dos anexos.

Esse plugin não funciona no app My Fluig e não exibe a aba anexos. Se usá-lo em processos mobile poderá ter problemas.
{: .bubble-warning}

Ciente dessas limitações vamos aos pontos positivos.

### Open Source

Você pode conferir o plugin e auxiliar no seu desenvolvimento, tanto fazendo um fork do projeto quanto abrindo issues.

O projeto está publicado no GitHub: [Fluig Form Attachment](https://github.com/brunogasparetto/fluig-form-attachment).

### Facilidade de Uso

Para usar o plugin basta baixar a [Última Release](https://github.com/brunogasparetto/fluig-form-attachment/releases/latest) e adicionar o arquivo
`.js` que lhe convém (a versão completa ou minificada) ao seu formulário.

A única diferença que terá no seu formulário será criar um campo do tipo `text` (preferencialmente marcado com readonly),
adicionar algumas propriedades nele para identificar o nome do anexo e tipos aceitos, e chamar os métodos do Plugin no
JavaScript do formulário.

### Controle dos Anexos e Prefixo no Nome

Os anexos serão inseridos no processo com o nome determinado no campo do formulário/plugin. Para garantir um controle exato não é permitido
ter nomes iguais, então há a opção de inserir prefixos no nome do campo para as situações de anexos com mesmo nome, algo comum em tabelas Pai x Filho.

Pelo campo do formulário é possível inserir, visualizar e remover o anexo. Isso automaticamente removerá o anexo do processo. Assim como é possível
remover vários anexos de uma só vez, imaginando que em uma linha da Pai x Filho você tenha muitos anexos, isso auxiliará na remoção.

## Exemplos de Uso do Plugin

Vou listar as situações que já passei ao utilizar o plugin para desenvolver alguns processos.

### Criando um campo de anexo

Esse exemplo exibirá um campo que sempre permitirá enviar, visualizar e remover o anexo. Porém quando aberto em modo Visualização somente o botão
de visualizar será exibido. Nesta situação somente serão aceitos arquivos do tipo imagem ou PDF, e o arquivo terá o nome `CNH` na aba de anexos.

```html
<input type="text" class="form-control" readonly
  name="cnh" id="cnh"
  data-filename="CNH"
  data-accept="image/*,.pdf"
>

<script src="fluigFormAttachment.min.js"></script>
<script>
  $(function () {
    $("#cnh").fluigFormAttachment();
  });
</script>
```
