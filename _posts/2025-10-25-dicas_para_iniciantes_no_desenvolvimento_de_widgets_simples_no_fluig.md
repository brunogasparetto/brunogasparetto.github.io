---
title: Dicas para iniciantes no desenvolvimento de widgets no Fluig
description: Uma porção de dicas para ajudar a entender as widgets do Fluig.
date: 2025-10-26 18:00:00 -0400
image:
  path: "/assets/img/2025-10-18-plugin_de_anexos_em_formulario_no_processo_do_fluig/cover.jpg"
  alt: "Dicas para Iniciantes em Widgets no Fluig"
  hide: true
categories: fluig
tags:
  - fluig
  - processos
  - widget
---

O Fluig possibilita carregar arquivos de aplicações web (tradução literal para os arquivos `.war`) e, após efetuada
a instalação no Fluig, podem ser inseridos em páginas personalizadas. Esses componentes são chamados de `widgets`.

Há algumas opções para desenvolvimento de widgets, sendo as mais comuns:

- Criar a estrutura de pasta no Eclipse ou VS Code, usando o Plugin/Extensão do Fluig, empacotar num arquivo .war e
exportar para o Fluig.
- Criar um projeto usando o [Maven](https://maven.apache.org/) e então compilar o código Java em um arquivo .war,
que também será exportado para o Fluig.

Ao criar uma widget usando código Java é possível ampliar as funções do Fluig, criando até APIs personalizadas, pois
teremos acesso a todo o SDK em back-end do Fluig. Esse assunto abordarei em postagens futuras.

Para muitas situações a primeira forma de widget, a mais "simples", é o suficiente. Pois podemos criar verdadeiros
portais dentro do Fluig, melhorando a experiência dos usuários.

Quando iniciei no desenvolvimento de widgets eu tive muitas dificuldades para encontrar material e aprender alguns
detalhes, por isso resolvi compartilhar algumas dicas para diminuir possíveis dores de cabeça.

A primeira dica é ler a documentação da TOTVS sobre widgets. A princípio pode parecer que é difícil encontrar a documentação,
afinal são muitos locais diferentes, por isso aqui vai uma relação das documentações com minhas dicas sobre cada uma.

## Documentações Oficiais

A [Documentação de Widget no TDN](https://tdn.totvs.com/display/public/fluig/Widgets) e a documentação
[Super Widget no Style Guide](https://style.fluig.com/javascript.html#super-widget) são os pontos iniciais para lermos.

No TDN aconselho a ler [Como criar um widget que busque conteúdo](https://tdn.totvs.com/pages/releaseview.action?pageId=185735401),
pois essa documentação mostra o básico de uma widget.

Nas Widgets usamos um template chamado Apache FreeMarker (FTL). É importante ler seu [Manual](https://freemarker.apache.org/docs/index.html)
para entender o que podemos executar. Esse template é executado no back-end do Fluig e então seu HTML é enviado para o navegador.

A primeira documentação "perdida" de widget se refere às variáveis e métodos que temos disponíveis no FreeMarker (FTL),
pois está na seção sobre Layouts do TDN. Por isso é importante ler sobre as
[Variáveis e Métodos no FTL](https://tdn.totvs.com/display/public/fluig/Layouts#Layouts-Vari%C3%A1veisDispon%C3%ADveisnoFTL).
Nessa documentação encontraremos variáveis que podem auxiliar na montagem do HTML (como login do usuário, URL do Fluig etc.),
além dos objetos para fazer a Internacionalização da widget, e até acessar o objeto VO do usuário, pegando sua matrícula e
outras informações.

E, não menos importante, o Fluig atualmente utiliza a JQuery como biblioteca JS para facilitar o desenvolvimento, então
ter um conhecimento sobre a [API da JQuery](https://api.jquery.com/) pode ajudar muito. Além, é claro, de estudar CSS
e o próprio [Fluig Style Guide](https://style.fluig.com/). Para manipulação de datas no navegador o Fluig já carrega
a biliteca [Moment.js](https://momentjs.com/), então ao invés de fazer as contas "na mão" ou pegar outra biblioteca,
pode ser interessante conhecer o funcionamento dela.

Com a chegada do Fluig 2.0 veio o Tema Escuro, então ao iniciar no desenvolvimento de widgets para essa versão do
Fluig é importante ler a documentação
[Desenvolvendo widgets compatíveis com modo escuro](https://tdn.totvs.com/pages/releaseview.action?pageId=965446583).

## Fluig Academy

O site [Fluig Academy](https://academy.fluig.com/) disponibiliza cursos gratuitos da TOTVS e ajuda demais a quem está
entrando no desenvolvimento para Fluig.

Para Widgets eu aconselho estudar todos os cursos da
[Trilha Iniciando o desenvolvimento de portais com o TOTVS Fluig Plataforma](https://academy.fluig.com/theme/totvs_fluig_academy/trilha.php?codigo=8).
Nessa trilha há cursos sobre Gestão de Portais, um curso inicial de desenvolvimento e outro curso ensinando a instalar
o Eclipse 2019-R9 com o plugin do Fluig. E, finalmente, cursos sobre widgets em si, que falarei detalhadamente.

O primeiro curso, que considero essencial, é [Iniciando o desenvolvimento de widgets](https://academy.fluig.com/theme/totvs_fluig_academy/landpage.php?course=97).
Aqui você aprenderá o conceito da `Super Widget`, que é a classe base da Widget no JS, além de aprender sobre modo de edição,
modo de visualização, os eventos da widget, como trabalhar com internacionalização e com as variáveis no FTL.

Já o curso [Preferências da widget, como salvar e recuperar os dados](https://academy.fluig.com/theme/totvs_fluig_academy/landpage.php?course=98),
ensinará algo que considero super importante para não "chumbar" valores no código da widget. Imagine que criamos uma widget que
deve inserir registros em um formulário. Para isso precisamos executar um Web Service ou API e nessas operações devemos informar
o ID do formulário (normalmente o ID da pasta que identifica o formulário). Se criamos um formulário e colocamos esse ID
manualmente no código da widget, ao exportar para Produção, deveremos colocar no código o ID do formulário em produção. Então,
para cada ambiente (Desenvolvimento, Homologação, Produção etc.) teremos que alterar o código-fonte da widget. Ao invés disso
devemos permitir que, ao configurar a widget em uma página do Fluig, possamos configurá-la indicando o ID do formulário. Assim
o código-fonte será o mesmo para todos os ambientes.

O curso [Templates Mustache em widgets, aprenda a desenvolver](https://academy.fluig.com/theme/totvs_fluig_academy/landpage.php?course=99),
ensina a utilizar esse sistema de template JS. Embora as widgets utilizem o FreeMarker como template, ele é utilizado no back-end
do Fluig e gera um HTML base pra sua widget. Enquanto o Mustache é um template que roda no navegador e você fará as integrações
com o JS da widget. O conhecimento desse curso pode ser aplicado também em formulários, principalmente quando deseja exibir informações
em uma Modal, por exemplo.

O curso [Widgets com APIs do TOTVS Fluig: Usuário logado](https://academy.fluig.com/theme/totvs_fluig_academy/landpage.php?course=117),
onde será ensinado a como efetuar consultas às APIs do Fluig em páginas privadas, cujo usuário está logado. Efetuar chamadas às APIs
em página pública exige alguma forma de autenticação e, erroneamente, vejo pessoas colocando as credenciais OAuth do Fluig diretamente
no JS carregado pelo navegador, permitindo que visitantes mal intencionados roubem essas credenciais. Por isso é necessária uma
abordagem diferente para as páginas públicas.

E, por último o curso [Adapte seu layout ao novo construtor de páginas](https://academy.fluig.com/theme/totvs_fluig_academy/landpage.php?course=72)
ensinará a como configurar sua widget para que ela funcione corretamente no novo layout de páginas do Fluig (a partir da versão 1.8.1).

## Conflito no Identificador (Código) da Widget

Quando criamos uma widget, layout ou página o Fluig pede que informemos o Identificador (Código) desse componente, que é uma string.
Esse código identifica um componente no servidor do Fluig e por isso deve ser único. Então pode acontecer de criarmos uma widget
e ao enviar para o servidor dar erro por já existir uma aplicação com esse mesmo código.

Como o identificador faz parte da URL que o Fluig cria para o componente ele não pode conter caracteres especiais. E, em geral,
somente as páginas possuem URLs que serão visíveis aos usuários, sendo que a widget e layout utilizam a URL internamente para
carregar os demais artefatos.

Por isso eu gosto de prefixar o Identificador da Widget com `w` e de Layouts com `l`, deixando somente as páginas sem um prefixo.
Isso ajuda muito quando vou criar uma widget que será exibida sozinha em uma página e quero dar a essa página um Identificador
que remeta à função da widget.

Por exemplo, vou criar uma página para exibir o Extrato Bancário do Banco XYZ. A widget teria o identificador `wExtratoBancoXYZ`,
enquanto a página teria o identificador `extratoBancoXYZ`. Desta forma a URL da página ficaria mais simples de ler para o usuário,
e a Widget reflete facilmente o que significa pelo código.

## Declaração da Super Widget

Ao criar uma widget pelo Eclipse o código JS padrão gerado, quando não utilizado template, será assim:

```javascript
var MyWidget = SuperWidget.extend({
  //variáveis da widget
  variavelNumerica: null,
  variavelCaracter: null,

  //método iniciado quando a widget é carregada
  init: function() {},

  //BIND de eventos
  bindings: {
    local: {
      'execute': ['click_executeAction']
    },
    global: {}
  },

  executeAction: function(htmlElement, event) {}
});
```
Eu recomendo alterar o nome da variável ao invés de usar esse padrão `MyWidget`. Porém ao fazer isso também deverá mudar o nome nos
arquivos `.ftl`.

Porém o mais importante nessa declaração é manter a variável declarada com `var`.

Por estarmos fazendo um código JS que roda no navegador podemos usar a versão mais atual do EcmaScript, assim podemos ficar tentados
a declarar com `const` ou `let`. Porém essa variável que contém a Super Widget deve ultrapassar o escopo no qual foi declarada, para
que seja acessível a outras partes do código pelo Fluig. Ao declararmos com `const` ou `let` essa variável não será acessível fora
do escopo, causando erro ao inicializar a widget.

Todas as outras variáveis da widget podem usar `const` e `let`, é o recomendado, mas a variável da SuperWidget não.

## Eventos das Widgets

Dentro do arquivo JS temos a propriedade `bindings`, para amarrar os eventos da widget. É bem comum ter confusão sobre quando usar os
eventos dentro de `local` e de `global`.

Resumindo, dentro de `local` estarão os eventos que serão disparados por elementos dentro da `div` da sua widget.

```html
<div
  id="MyWidget_${instanceId}"
  class="super-widget wcm-widget-class fluig-style-guide"
  data-params="MyWidget.instance()"
>
    <p><button type="button" data-clique-botao class="meuBotao">Clique</button></p>
</div>
```
Essa `div` é passada ao JS da widget (acessível por `this.DOM`). Quando usamos um evento `local` o Fluig procurará somente dentro dos
elementos que existem nessa DIV.

Quando criamos uma Modal, por exemplo, ela não é inserida dentro da DIV da widget e sim no `body` do HTML. Nessa situação devemos
usar um evento `global`.

```javascript
var MyWidget = SuperWidget.extend({
  init() {},

  //BIND de eventos
  bindings: {
    local: {
      'clique-botao': ['click_executeAction'] // Execute quando o elemento está na DIV da Widget
    },
    global: {
      'clique-modal': ['click_salvaModal'] // Execute quando o elemento está fora da DIV da Widget
    }
  },

  executeAction(htmlElement, event) {},
  salvaModal(htmlElement, event) {}
});
```

Vale ainda lembrar que não somos obrigados a usar o binding padrão do Fluig. Podemos usar o recurso padrão do navegador para tratar
os eventos, assim como a própria `JQuery`. Eu uso o binding padrão do Fluig em raras situações, basicamente somente para o evento
de salvar preferências da widget. Para outros casos uso mais o controle da JQuery, por achar mais intuitivo.

Importante, quando não usar o binding padrão do Fluig, é sempre restringir seu evento a rodar somente na DIV indicada, evitando conflitos
com outras widgets instanciadas na mesma página. Por isso use sempre o ID da div como restritor, no caso de eventos locais. Por exemplo,
para o ftl acima poderíamos usar algo como:

```javascript
var MyWidget = SuperWidget.extend({
  init() {
    $(`#MyWidget_${this.instanceId}`).on("click", ".meuBotao", this.executeAction);

    $(`#MyWidget_${this.instanceId}`).on("click", ".meuBotao", this, this.executeOtherAction);

    $(`#MyWidget_${this.instanceId}`).on("click", ".meuBotao", event => {
      // this será o objeto widget, pois arrow function não possuí contexto this
      // pegando assim o this do escopo superior.
    });

  },

  bindings: { local: {}, global: {} },

  executeAction(event) {
    // this será o elementoHTML do botão, não da widget
  },

  executeOtherAction(event) {
    // this será o elementoHTML do botão, não da widget
    // event.data será o "this" da widget
  }
});
```
Mas nesse formato criamos um problema da JQuery, que é mudar o contexto do `this` dentro da função chamada pelo evento. A JQuery coloca
o `this` na função sendo o ElementoHTML que disparou o evento. Então se precisar acessar o `this` da widget terá que passá-lo como `data`
para o evento.

## Carregando Arquivos da Widget e Componentes do Style Guide

No arquivo `application.info` temos as propriedades que indicam os arquivos que serão carregados na widget, como recursos. Por padrão
ele já vem preenchido com o arquivo principal de JS e CSS.

```
application.resource.js.1=/resources/js/wMinhaWidget.js
application.resource.js.2=/resources/js/outroArquivo.js
application.resource.css.3=/resources/css/wMinhaWidget.css
application.resource.component.4=fluigfilter
```

É importante sempre incrementar o número do recurso, indiferente se é um arquivo JS, CSS ou um Componente do Style Guide. O fato
de não incrementar esse número pode ocasionar problemas no carregamento.

O Fluig montará a URL para o recurso da seguinte forma: `<domínio_do_fluig>/<codigo_widget><endereco_indicado_no_application.resource>`.
Então, considerando que a widget tenha o código `wMinhaWidget`, e estamos enviando ela para o Lab Fluig,
o endereço do primeiro recurso indicado acima será: `https://lab.fluig.com/wMinhaWidget/resources/js/wMinhaWidget.js`.

Quando indicamos um `component` o Fluig entende que é um recurso específico do Style Guide, então carregará todos os arquivos necessários
do componente. Na documentação de cada componente sempre terá uma seção explicando como carregá-lo em uma widget.

## Problemas com Cache da Widget

Em algumas situações fazemos alguma alteração no JS da widget e o navegador não puxa o arquivo atualizado, afinal ele trabalha
com cache.

O Fluig, automaticamente, coloca a versão da widget ao final da chamada dos arquivos identificados como `resource` no `application.info`,
porém o Eclipse gera esse arquivo com o seguinte formato padrão:

```
application.version=${build.version}-${build.revision}
view.file=view.ftl
edit.file=edit.ftl
application.resource.js.1=/resources/js/wEclipseWidgetBase.js
application.resource.css.2=/resources/css/wEclipseWidgetBase.css
```
A propriedade `application.version` identifica a versão da sua widget. Porém o conteúdo que o Eclipse fornece por padrão é substituído
pela versão do Fluig, incluindo sua revisão. Então imagine que estamos usando o Fluig 1.8.2 revisão 20250601. Ao montar a URL para baixar
o arquivo JS ela ficará assim: `/resources/js/wEclipseWidgetBase.js?v=1.8.2-20250601`. Desta forma não importa se você atualizar os
arquivos, pois o navegador receberá a mesma URL que já estava antes e o navegador usará o cache ao invés de baixar o novo arquivo.

Para forçar o navegador a baixar o novo arquivo basta mudar a propriedade `application.version`. Você pode trabalhar com um número incremental,
assim a cada alteração que fizer na widget aumente em 1 o valor que está nessa propriedade. Eu, preferencialmente, gosto de trabalhar com
[Versionamento Semântico](https://semver.org/lang/pt-BR/).

## Acessando Dataset e Campo Zoom

Assim como em formulários somos obrigados a importar o arquivo `/webdesk/vcXMLRPC.js` na widget para ter acesso ao `DatasetFactory`.
Porém não conseguimos indicar esse arquivo como um recurso dentro do `application.info`.

A solução para esse caso é importar, via tag `script`, dentro do arquivo `view.ftl` e `edit.ftl`.

Podemos usar a mesma solução para importar arquivos CSS que estão em outra Widget ou em sites externos, ou simplesmente efetuar
o import dentro do CSS da widget.

```html
<#assign parameters = '{"folderId": ${folderId!0}}'?html>
<div id="wAgenciaExpedicao_${instanceId}"
  class="super-widget wcm-widget-class fluig-style-guide"
  data-params="wAgenciaExpedicao.instance(${parameters})"
>
  <style>
      @import url("/fluighelpers/resources/css/fluigstyle.min.css");
      @import url("/fluighelpers/resources/css/datatables/jquery.dataTables.min.css");
  </style>
  <script src="/webdesk/vcXMLRPC.js"></script>
  <script src="/fluighelpers/resources/js/request.min.js"></script>
  <script src="/fluighelpers/resources/js/validators.min.js"></script>
  <script src="/fluighelpers/resources/js/datatables/jquery.dataTables.min.js"></script>

  <!-- Continua o código da widget -->
</div>
```

Outra dúvida muito comum é como fazer um campo Zoom na widget. Infelizmente não é possível do jeito "tradicional".

Ocorre que o campo Zoom só funciona em formulários, pois o Fluig interpretará o conteúdo do `input` e carregará
os dados conforme indicados na documentação. Porém o campo Zoom nada mais é do que o componente `filter` do Style Guide.

Assim basta seguir a [documentação do Filter](https://style.fluig.com/miscellaneous.html#filter) para inserir na widget.

Mas lembre-se: não estamos amarrados aos componentes padrões do Fluig. Eu sou muito mais acostumado a usar a bilioteca
[Select2](https://select2.org/) para criar combo-box e a acho, visualmente, melhor, além de ter uma API amigável e
que fornece uma customização incrível.

## Usando AngularJS, React ou VueJs

É possível utilizar AngularJS, React, VueJS ou qualquer outra biblioteca/framework nas widgets. A única
dificuldade é fazer o build externamente e então colocar seus artefatos, de forma adaptada, dentro da widget.

A TOTVS possuí vários vídeos explicando o procedimento para AngularJS, porém eles ensinam a fazer a widget com o Maven,
e ao compilar ele efetua o build da aplicação.

- [Live Code: Desenvolvendo aplicações Angular dentro da Plataforma TOTVS Fluig](https://youtu.be/l6V32ngoGTQ)
- [LIVE CODE - Angular no TOTVS Fluig: dicas e truques para impulsionar o desenvolvimento](https://youtu.be/XwkptcILAGE)
- [Angular no TOTVS Fluig: trabalhando com rotas e lazy load](https://youtu.be/k_XyfnbKRYs)

O Sérgio Machado publicou a super aula [Executando uma aplicação Angular dentro de uma Widget do Fluig](https://youtu.be/9aeAYEIOWJg),
explicando como fazer o build da aplicação AngularJS e então inserir dentro da Widget. Seguindo essa orientação podemos abstrair
para as outras bibliotecas/frameworks.

## Acessando Serviços Externos

Sempre que precisamos acessar algum Serviço Web que exija credenciais não o faça diretamente pelo JS da widget, pois como ele
é carregado no navegador é muito simples descobrir as credenciais.

Para essas situações usar Dataset é a melhor opção.

Você deve cadastrar os serviços web no Painel de Controle do Fluig, então criar um Dataset que chamará esses serviços, rodando assim
toda a autenticação em back-end, sem risco de exibir as credenciais do serviço.

Quando é necessário passar informações para o Serviço Externo o comum é fazer o Dataset receber parâmetros através das constraints,
tratar esses parâmetros e então usá-los na requisição ao Serviço.

Claro, quando estiver usando um serviço público, que não precisa de credenciais, não há problema algum em efetuar a chamada diretamente,
como ao consultar um CEP nem algum serviço gratuito sem autenticação.

## Problemas com Acentuação

Sempre utilize arquivos com codificação UTF-8, evitando assim problemas com acentuação nos arquivos.

Porém ainda assim o Fluig tem um problema ao ler caracteres especiais no arquivo `application.info` e
nos arquivos de tradução, os `.properties`.

De acordo com a documentação oficial é necessário "escapar" esses caracteres usando código unicode, mesmo os arquivos
estando na codificação UTF-8.

Exemplo gerado pelo próprio Eclipse:

```
application.title=Ol\u00E1 Mundo
application.description=Ol\u00E1 Mundo
hello.example.hello=Ol\u00E1 Mundo!
hello.example.helloedit=Ol\u00E1 Mundo! (Edit)
hello.button.showMessage=Exibir mensagem
```

Para gerar esse escape dos caracteres você pode usar algum site de formatação para JS, como o [FreeFormater.com](https://www.freeformatter.com/javascript-escape.html),
ou criar uma função que faça isso para você. Segue um código, em JS, que efetua esse escape.

```javascript
/**
 * Converte uma string para o seu equivalente em notação de escape Unicode (\uXXXX).
 *
 * @param {string} str A string a ser convertida.
 * @returns {string}
 */
function stringParaEscapeUnicode(str) {
  let resultado = '';

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);

    if (code < 128) {
      resultado += str[i];
      continue;
    }

    const hex = code.toString(16).toUpperCase().padStart(4, '0');
    resultado += `\\u${hex}`;
  }

  return resultado;
}

```

É possível colar essa função no console do navegador, no modo desenvolvedor, e ir aplicando nos textos que possuem caracteres
acentuados ou especiais, como emojis.

Ainda sobre Internacionalização, as propriedades `application.title` e `application.description` serão exibidas no construtor
de páginas do Fluig quando for selecionar a widget. Então sempre que fizer widgets que possuam internacionalização é importante
preencher essas propriedades.

## Passando valores salvos nas preferências

No curso "Preferências da widget, como salvar e recuperar os dados" isso é ensinado, mas fica uma dica rápida, porque quando descobri
isso não existia esse curso disponível e sofri bastante.

Quando salvamos algum valor nas preferências da Widget esse valor é carregado no template FTL, mas não é passado automaticamente para
a Super Widget. Nós devemos fazer isso ao declarar a propriedade `data-params` na DIV da widget, tanto em visualização quanto em edição.

Eu gosto de fazer dessa forma:

```html
<#assign parameters = '{"folderId": ${folderId!0}}'?html>
<div id="wAgenciaExpedicao_${instanceId}" class="super-widget wcm-widget-class fluig-style-guide"
    data-params="wAgenciaExpedicao.instance(${parameters})"
>
```

O comando `assign` serve para declarar uma variável, a qual dei o nome de `parameters` e será uma string escapada para `HTML`.
Essa string nada mais é do que um objeto JS. O trecho `${folderId!0}` buscará a variável `folderID`, que é o nome que dei
ao salvar o valor nas preferências. Ao usar o `!` estou informando que caso a variável não exista (primeira vez  configurando a widget)
deve-se utilizar o valor a seguir como padrão, que no caso é `0`. Depois disso simplesmente passo essa string ao instanciar a Super Widget,
ficando assim acessível em `this.folderId`.

## Propriedades Públicas e Privadas

O padrão da widget é que a variável da SuperWidget é acessível pelo navegador e podemos executar, via console do inspetor de desenvolvimento,
suas propridades e métodos. Por exemplo, tenho o método `calculaFrete` na widget, então eu posso ir no console do navegador e digitar
`MyWidget.calculaFrete()` e o método será executado.

Eu gosto de trabalhar com conceito de público e privado, impedindo expor externamente os métodos e variáveis. Para isso utilizo o conceito de
função autoexecutável ao declarar a SuperWidget e retorno um objeto somente com o necessário para o Fluig.

```javascript
var MinhaWidget = SuperWidget.extend((function () {

  /**
   * Elementos públicos da Widget
   *
   * Tudo que é declarado aqui é acessível pela variável da Widget
   */
  const widget = {
    /**
     * Eventos da Widget
     */
    bindings: {
      local: { "save-settings": ["click_saveSettings"] },
      global: {}
    },

    /**
     * Método disparado automaticamente quando a Widget é iniciada
     */
    init() {
      if (this.isEditMode) {
        // Modo de Configuração
        return;
      }

      this.initWidgetElements();

      widgetElements.loading.show();

      // Resto da programação de inicialização da widget

      widgetElements.loading.hide();
    },

    /**
     * Cria um "cache" dos elementos HTML da Widget
     *
     * O cache ajuda a não gastar processamento pesquisando itens no DOM
     */
    initWidgetElements() {
      widgetElements.instanceId = this.instanceId,
      widgetElements.loading = FLUIGC.loading(
        window,
        { textMessage: "Processando Dados. Favor aguardar." }
      );
    },

      /**
       * Salva as configurações da Widget na tela de edição
       */
      saveSettings() {
        WCMSpaceAPI.PageService.UPDATEPREFERENCES(
          {
            async: true,
            success: function(data) {
              FLUIGC.toast({
                message: data.message,
                type: "success"
              });
            },
            fail: function(xhr, message, errorData) {
              console.log(xhr, message, errorData);
              FLUIGC.toast({
                message: errorData.message,
                type: "danger"
              });
            }
          },
          this.instanceId,
          {
            // Dados a enviar
          }
        );
      },
  };

  /*
    * Itens privados da Widget
    * Nada a partir daqui é acessível pela variável da Widget
    */

  /**
   * Elementos que compõem a Widget (cache para performance)
   */
  const widgetElements = {
    /**
     * ID da instância para acessar fora do objeto widget
     *
     * @type {number}
     */
    instanceId: 0,

    /**
     * Tela de carregamento
     *
     * @type {Loading}
     */
    loading: null,
  };

  // Continuar a programação

  return widget;
})());
```
Essa dica é muito particular de cada desenvolvedor. Eu me organizo melhor dessa forma.
