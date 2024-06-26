---
title: "HTML Purifier - Um pouco a mais da simples limpeza"
description: "Efetuando uma limpeza poderosa no HTML para evitar dores de cabeça com conteúdo indesejado e possíveis quebras de layout."
date: 2018-03-30 19:00:00 -0400
categories: php
tags:
  - desenvolvimento
  - php
  - html
  - purifier
---

Tratar entrada de usuário é obrigação, principalmente se permitirmos que ela seja em HTML. Embora os editores WYSIWYG
possuam configurações de limpeza nós não podemos escapar dessa árdua tarefa no back-end.

Há alguns anos conheci o [HTML Purifier](http://htmlpurifier.org/) e ele virou a ferramenta que mais utilizo para
"limpar" o HTML.

Infelizmente quase sempre usei a configuração padrão do HTML Purifier.
Em partes por que me atendia bem, mas também por que a documentação não é muito atrativa.

> Porém, a vida é uma caixinha de surpresas e numa bela manhã de Sol [...]

Recentemente estava trabalhando numa versão antiga do [Moodle](https://moodle.org/), que está utilizando
o framework [Bootstrap](https://getbootstrap.com/), e comecei a perceber problemas com conteúdo HTML dos alunos,
principalmente quando eles copiavam o texto de páginas Web.

Devido ao texto vir com "sujeira" (muito CSS inline e elementos com tamanhos definidos com width e height) o
layout ficava destoante e em alguns casos ficava quebrado mesmo, impedindo que o grid se ajustasse à largura da tela.

E como a necessidade nos força a sair da zona de conforto resolvi estudar mais a documentação do HTML Purifier
e aqui estou pra entregar um pouco do que aprendi.

## Funcionamento básico

O exemplo mais simples de uso do HTML Purifier, após incluir o autoload, é:

```php
<?php

$config = HTMLPurifier_Config::createDefault();
$purifier = new HTMLPurifier($config);
$html_limpo = $purifier->purify($html_sujo);
```

A configuração padrão do HTML Purifier atende muito bem na maioria dos casos.
Na página de [demonstração](http://htmlpurifier.org/demo.php) é possível testar as opções de configuração.

Mas é na [documentação da configuração](http://htmlpurifier.org/live/configdoc/plain.html) que tudo começa a
ficar mais interessante.

## Configurando o HTML Purifier

Para definir um item da configuração basta copiar seu nome na página de configuração e passar o valor desejado
à variável de configuração, que sempre trarei na variável **$config**. Os nomes são bem explicativos.

```php
<?php

$config = HTMLPurifier_Config::createDefault();
$config->set('AutoFormat.RemoveEmpty', true);
$config->set('AutoFormat.RemoveEmpty.RemoveNbsp', true);
```

### Uma configuração menos permissiva

Para o meu caso eu precisava remover várias propriedades, classes e até elementos do HTML que o usuário postava. Basicamente eu poderia permitir somente algumas propriedades como cores, negrito, alinhamento etc.

Pensando em tudo que era permitido e proibido eu fiz a seguinte configuração:

```php
<?php

$allowedStyleProperties = [
    'color',
    'background-color',
    'font-size',
    'font-weight',
    'text-align',
    'text-decoration',
];

$allowedClasses = [
    'img-responsive',
    'table',
    'table-responsive',
    'table-bordered',
    'table-condensed',
];

$forbiddenElements = [
    'script',
    'style'
];

/*
 * Aqui o padrão é tag@attribute
 * O asterisco no lugar da tag indica que tratará todas as tags
 */
$forbiddenAttributes = [
    '*@width',
    '*@height',
    'table@border',
    'table@cellpadding',
    'table@cellspacing',
];

$config = HTMLPurifier_Config::createDefault();
$config->set('CSS.AllowedProperties', $allowedStyleProperties);
$config->set('Attr.AllowedClasses', $allowedClasses);
$config->set('HTML.ForbiddenElements', $forbiddenElements);
$config->set('HTML.ForbiddenAttributes', $forbiddenAttributes);
$config->set('AutoFormat.RemoveEmpty', true);
$config->set('AutoFormat.RemoveSpansWithoutAttributes', true);
$config->set('Output.Newline', "\n");
$config->set('AutoFormat.RemoveEmpty.RemoveNbsp', true);
$config->set('HTML.TidyLevel', 'heavy');
```

## As transformações do HTML Purifier

Se você prestou atenção nas configurações deve ter notado a `HTML.TidyLevel`.

O HTML Purifier utiliza essa configuração para substituir as tags e atributos descontinuados por tags e
atributos atualizados. Ou seja, ele pega um HTML assim:

```html
<p align="center" bgcolor="#FFFFFF">Centralizado e Branco</p>
<center>Centralizado!</center>
```

E deixa assim:

```html
<p style="text-align:center; background-color: #FFFFFF">Centralizado e Branco</p>
<div style="text-align:center">Centralizado!</div>
```

A ótima notícia é que podemos usar a ferramenta de análise e transformação do HTML Purifier
para fazer as nossas modificações.

Podemos personalizar as definições do HTML, olha só a
[documentação de personalização](http://htmlpurifier.org/docs/enduser-customize.html),
mas isso é tema pra outro post. Por enquanto usar as transformações é o suficiente.

### Transformando Atributos

Para alterar os atributos basta criar uma classe que estenda a `HTMLPurifier_AttrTransform` e
implemente o método `transform`, o qual recebe os atributos da tag, além da configuração e contexto,
realiza as mudanças e então retorna os atributos.

No diretório `library/HTMLPurifier/AttrTransform` há várias classes utilizadas pelo HTML Purifier e
que podemos usar como exemplo para desenvolver as nossas. Todas estendem a classe `HTMLPurifier_AttrTransform` e
implementam o método `transform`.

### Transformando Elementos

De forma semelhante às transformações de atributos podemos realizar transformações completas nos elementos.

Podemos criar uma classe que estenda a `HTMLPurifier_TagTransform` e que
implemente o método `transform`, o qual recebe a tag, a configuração e o contexto.

No diretório `library/HTMLPurifier/TagTransform` há duas classes utilizadas pelo HTML Purifier, a classe que
transforma a tag **font** e uma classe mais "genérica" que trata todas as outras transformações simples,
a `HTMLPurifier_TagTransform_Simple`.

### Configurando o HTML Purifier para usar as transformações

Toda a configuração das transformações ficam nas definições do HTML.
Para pegar as definições basta usar o método `getHTMLDefinition` na **$config** e você receberá uma
instância da `HTMLPurifier_HTMLDefinition`.

Nesse objeto de definições há 3 propriedades públicas que recebem as nossas instâncias de transformações.

- **info_tag_transform** é um array cujo índice é o nome da tag a transformar
- **info_attr_transform_pre** é um array de índice numérico que transformará os atributos no início do processo
- **info_attr_transform_post** é um array de índice numérico que transformará os atributos no final do processo

Poderíamos configurar o HTML Purifier para fazer algumas trocas de teste assim:

```php
<?php

$htmlDefinition = $config->getHTMLDefinition();

// Transformará toda tag p em uma tag div com CSS inline para deixar o texto com sublinhado
$htmlDefinition->info_tag_transform['p'] = new HTMLPurifier_TagTransform_Simple(
    'div',
    'text-decoration:underline;'
);

// Converte o atributo bgcolor em um CSS inline
$htmlDefinition->info_attr_transform_pre[] = new HTMLPurifier_AttrTransform_BgColor();

// Tudo configurado basta instanciar o HTML Purifier
$purifier = new HTMLPurifier($config);
$html_limpo = $purifier->purify($html_sujo);
```

## Criando as nossas transformações

Para o meu caso eu precisava cumprir esses objetivos:

- Adicionar a classe **img-responsive** às tags **img**
- Adicionar as classes **table** e **table-condensed** às tags **table**
- Adicionar a classe **table-bordered** se a tag **table** possuir o atributo **border**
- Cercar a tabela com uma **div** que possua a classe **table-responsive**

Com isso em mente vamos ao trabalho.

### Adicionando as classes básicas nas tags

Para adicionar as classes padrões que não dependem de alguma verificação criei uma classe genérica baseada na
classe `HTMLPurifier_TagTransform_Simple`.

```php
<?php

/**
 * Adiciona as classes indicadas a um elemento HTML
 */
class TagClassTransform extends HTMLPurifier_TagTransform
{
    /**
     * @var array
     */
    protected $classes = [];

    /**
     * @param string[]|string $classes Classes a inserir no elemento
     */
    public function __construct($classes)
    {
        if (is_string($classes)) {
            $classes = explode(' ', $classes);
        }
        $this->classes = array_unique(array_map('trim', $classes));
    }

    /**
     * @param HTMLPurifier_Token_Tag $tag
     * @param HTMLPurifier_Config $config
     * @param HTMLPurifier_Context $context
     * @return HTMLPurifier_Token_Tag
     */
    public function transform($tag, $config, $context)
    {
        // Se for a tag de fim não precisa alterar nada
        if (empty($this->classes) || $tag instanceof HTMLPurifier_Token_End) {
            return $tag;
        }

        $new_tag = clone $tag;

        if (empty($new_tag->attr['class'])) {
            $new_tag->attr['class'] = '';
        }

        $new_tag->attr['class'] = $this->appendClasses($new_tag->attr['class']);
        return $new_tag;
    }

    /**
     * Concatena as classes da instância à string de classes já definidas
     * @param string $classes
     * @return string
     */
    protected function appendClasses($classes = '')
    {
        return implode(
            ' ',
            array_unique(
                array_merge(
                    array_map('trim', explode(' ', $classes)),
                    $this->classes
                )
            )
        );
    }
}
```

Então configuramos a definição do HTML com as novas instâncias de transformações.

```php
<?php

$htmlDefinition->info_tag_transform['table'] = new TagClassTransform('table table-condensed');
$htmlDefinition->info_tag_transform['img']   = new TagClassTransform('img-responsive');
```

Com essa configuração já podemos converter esse HTML:

```html
<p style="width:600px"><img src="hello_world.jpg"></p>

<table border="1" cellpadding="5" cellspacing="5" align="center">
    <tbody>
        <tr>
            <td>Hey!</td>
            <td>Ho!</td>
            <td>Lets Go!</td>
        </tr>
    </tbody>
</table>
```

Nessa versão quase pronta:

```html
<p><img src="hello_world.jpg" class="img-responsive" alt="hello_world.jpg" /></p>

<table class="table table-condensed">
    <tbody>
        <tr>
            <td>Hey!</td>
            <td>Ho!</td>
            <td>Lets Go!</td>
        </tr>
    </tbody>
</table>
```

### Trocando o atributo border pela classe table-bordered

Precisamos fazer a troca do atributo **border**, independente do seu valor, pela classe
**table-bordered**. Para isso basta criar uma classe estendendo a `HTMLPurifier_AttrTransform` e
então adicionar uma instância dela ao array `$htmlDefinition->info_attr_transform_pre`.

```php
<?php

/**
 * Transforma o atributo border em uma classe css
 */
class TableBorderAttrTransform extends HTMLPurifier_AttrTransform
{
    /**
     * @var array
     */
    protected $classes = ['table-bordered'];

    /**
     * @param array $attr
     * @param HTMLPurifier_Config $config
     * @param HTMLPurifier_Context $context
     * @return array
     */
    public function transform($attr, $config, $context)
    {
        /*
         * O método é chamado para todas as tags, porém só quero realizar a transformação
         * quando for a tag table e atributo border
         */
        if (!isset($attr['border']) || $context->get('CurrentToken')->name !== 'table') {
            return $attr;
        }

        // A intenção é trocar o atributo, então já podemos removê-lo
        unset($attr['border']);

        if (empty($attr['class'])) {
            $attr['class'] = '';
        }

        $attr['class'] = $this->appendClasses($attr['class']);

        return $attr;
    }

    /**
     * Concatena as classes da instância à string de classes já definidas
     * Ps: sim, poderíamos fazer uma trait
     * @param string $classes
     * @return string
     */
    protected function appendClasses($classes = '')
    {
        return implode(
            ' ',
            array_unique(
                array_merge(
                    array_map('trim', explode(' ', $classes)),
                    $this->classes
                )
            )
        );
    }
}

// Então adicionar nas definições HTML
$htmlDefinition->info_attr_transform_pre[] = new TableBorderAttrTransform();
```

E agora aquele HTML sujo:

```html
<p style="width:600px"><img src="hello_world.jpg"></p>

<table border="1" cellpadding="5" cellspacing="5" align="center">
    <tbody>
        <tr>
            <td>Hey!</td>
            <td>Ho!</td>
            <td>Lets Go!</td>
        </tr>
    </tbody>
</table>
```

Fica assim:

```html
<p><img src="hello_world.jpg" class="img-responsive" alt="hello_world.jpg" /></p>

<table class="table table-condensed table-bordered">
    <tbody>
        <tr>
            <td>Hey!</td>
            <td>Ho!</td>
            <td>Lets Go!</td>
        </tr>
    </tbody>
</table>
```

## Criando um wrapper para a tabela

Para a tabela não extrapolar os limites da área devemos cercá-la com uma **div.table-responsive**.

Agora é hora de bater um pouco a cabeça. Como usar a transformação para criar um wrapper na nossa tabela?

Simplesmente não vamos utilizar, afinal não queremos transformar uma table e sim inserir algo antes e depois dela.

O HTML Purifier usa a classe `HTMLPurifier_Injector` para fazer inserções no HTML.
Por exemplo a opção `AutoFormat.Linkify` usa injector para inserir a tag **a** com o atributo **href**
em torno de um texto que case com a regra de URL.

Utilizar injector é mais complexo do que uma TagTransform por que você analisará os tokens que formam o HTML,
mas é possível resolver mais fácil do que os quebra-cabeças do novo filme da Lara Croft.

Dê uma olhada no diretório `library\HTMLPurifier\Injector` e ficará surpreso com as inserções que o Purifier já possui.

Basicamente a `HTMLPurifier_Injector` possui 3 métodos para trabalhar com os tokens analisados.

- **handleText**: chamado quando o token é um texto
- **handleElement**: chamado quando o token é uma tag de início ou vazia
- **handleEnd**: chamado quando o token é uma tag de fim

Todos os métodos recebem uma referência de `HTMLPurifier_Token` e ela será modificada caso queira adicionar algo.
Geralmente será convertida em um array e então adicionará tokens neste array na sequência necessária.

É importante observar as propriedades **name** e **needed** da `HTMLPurifier_Injector`.

A propriedade `name` indica o nome do seu injector e a `needed` indica quais tags e atributos são necessários para ela
funcionar (a `HTMLPurifier_Injector` identifica o `needed` e caso exista alguma regra que proíba as tags e
atributos já cancela a sua execução).

 Nosso injector ficou assim:

 ```php
 <?php

/**
 * Cerca a nossa tabela com uma div que possui a classe CSS table-responsive
 */
 class TableResponsiveWrapperInjector extends HTMLPurifier_Injector
{
    // O nome do nosso injector
    public $name = 'TableResponsiveWrapper';

    // O que precisamos que seja permitido para podermos inserir
    // Se na configuração proibiram a tag table ou div não há motivo para trabalhar
    public $needed = [
        'table',
        'div' => ['class'],
    ];

    /**
     * @param HTMLPurifier_Token_Start $token
     */
    public function handleElement(&$token)
    {
        /*
         * Esse método é executado em todo token que indica um início
         * Se não for uma tag table simplesmente ignoramos
         */
        if (!$token->is_tag || $token->name !== 'table') {
            return;
        }

        // Copiando o token para não o perdermos
        $table = clone $token;

        /*
         * Transformando o token original em um array e
         * inserindo os tokens na sequência necessária
         */
        $token = [
            new HTMLPurifier_Token_Start('div', ['class' => 'table-responsive']),
            $table,
        ];
    }

    /**
     * @param HTMLPurifier_Token_End $token
     */
    public function handleEnd(&$token)
    {
        /*
         * Esse método é executado em todo token que indica um fim
         * Se não for uma tag table simplesmente ignoramos
         */
        if (!$token->is_tag || $token->name !== 'table') {
            return;
        }

        // Copiando o token para não o perdermos
        $table = clone $token;

        /*
         * Transformando o token original em um array e
         * inserindo os tokens na sequência necessária
         */
        $token = [
            $table,
            new HTMLPurifier_Token_End('div'),
        ];
    }
}
```

Vamos adicionar nosso injector na definição HTML:

```php
<?php

$htmlDefinition->info_injector[] = new TableResponsiveWrapperInjector();
```

E agora nosso HTML limpo ficou pronto:

```html
<p><img src="hello_world.jpg" class="img-responsive" alt="hello_world.jpg" /></p>

<div class="table-responsive"><table class="table table-condensed table-bordered">
    <tbody>
        <tr>
            <td>Hey!</td>
            <td>Ho!</td>
            <td>Lets Go!</td>
        </tr>
    </tbody>
</table></div>
```

### Código fonte completo

Você pode visualizar o código completo no meu [Gist](https://gist.github.com/brunogasparetto/63f42e44388f13153b57e4c02df33f27).

## Algumas dicas extras

Use o HTML Purifier antes de persistir os dados (indiferente se utilizar arquivos ou banco de dados), pois o processo de analisar e converter o HTML é custoso e não deve ser executado todas as vezes que for exibir na tela. Então o melhor é já salvar limpo.

Reduza o HTML antes de salvá-lo para economizar espaço. Durante esse processo eu utilizei a [Tiny Html Minifier](https://github.com/jenstornell/tiny-html-minifier) e gostei do resultado.

Caso você permita edição é bom salvar o HTML original.
