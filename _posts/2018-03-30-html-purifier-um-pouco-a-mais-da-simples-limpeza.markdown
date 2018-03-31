---
layout: post
title:  "HTML Purifier - Um pouco a mais da simples limpeza"
date:   2018-03-30 19:00:00 -0400
excerpt: Aprenda a transformar elementos e atributos ao tratar o HTML com o HTML Purifier
tags:
    - dev
    - php
    - html purifier
---

Tratar entrada de usuário é obrigação, principalmente se permitirmos que ela seja em HTML. Embora os editores WYSIWYG sejam ótimos com as suas várias configurações não podemos escapar dessa árdua tarefa no back-end.

Há alguns anos conheci o [HTML Purifier](http://htmlpurifier.org/) e ele virou a ferramenta que mais utilizo para "limpar" o HTML. Infelizmente confesso que quase sempre usei a configuração padrão. Em partes por que me atendia bem, mas também por que a documentação não é muito atrativa.

> Porém, a vida é uma caixinha de surpresas e numa bela manhã de Sol [...]
>
> \- Narrador nada motivacional.

Recentemente estava trabalhando numa versão antiga do [Moodle](https://moodle.org/), que está com um layout adaptado em [Bootstrap](https://getbootstrap.com/), e comecei a perceber problemas com conteúdo HTML dos alunos, principalmente quando eles copiavam o texto de páginas Web.

Devido ao texto vir com "sujeira" (muito CSS inline e elementos com tamanhos definidos com width e height) o layout ficava destoante e em alguns casos ficava quebrado mesmo, impedindo que o grid se ajustasse à largura da tela.

E como a necessidade nos força a sair da zona de conforto resolvi estudar melhor o HTML Purifier e aqui estou pra entregar um pouco do que aprendi.

## Funcionamento básico

O exemplo mais simples de uso do HTML Purifier é:

```php
<?php

/*
 * Necessário incluir o arquivo library/HTMLPurifier.auto.php
 * ou o arquivo vendor/autoload.php se instalou com o Composer
 */

$config = HTMLPurifier_Config::createDefault();
$purifier = new HTMLPurifier($config);
$html_limpo = $purifier->purify($html_sujo);
```

A configuração padrão do HTML Purifier atende muito bem na maioria dos casos. Na página de [demonstração](http://htmlpurifier.org/demo.php) é possível testar as opções de configuração. Mas é na [documentação da configuração](http://htmlpurifier.org/live/configdoc/plain.html) que começa a ficar mais interessante.

Não vou detalhar todas as opções de configuração. O foco serão os passos que utilizei para adaptar os elementos como eu queria para o layout Bootstrap.

## Configurando o HTML Purifier

Para definir um item da configuração basta copiar seu nome na página de configuração e passar o valor desejado à configuração, que sempre trarei na variável **$config**.

```php
<?php

$config = HTMLPurifier_Config::createDefault();

// Remove tags vazias
$config->set('AutoFormat.RemoveEmpty', true);

// Considera como vazia uma tag que só tenha espaço em branco e &nbsp;
$config->set('AutoFormat.RemoveEmpty.RemoveNbsp', true);
```

### Uma configuração menos permissiva

Eu quero impedir que o usuário determine as dimensões de qualquer tag pra evitar que ultrapasse a largura da tela. Além disso quero limitar as classes e as possibilidades de CSS inline. Então a minha configuração inicial ficou assim:

```php
<?php

$CssPropriedadesPermitidas = [
    'color',
    'background-color',
    'font-size',
    'font-weight',
    'text-align',
    'text-decoration',
];

$classesPermitidas = [
    'img-responsive',
    'table',
    'table-responsive',
    'table-bordered',
    'table-condensed',
];

$tagsProibidas = [
    'script',
    'style'
];

/*
 * Aqui o padrão é tag@atributo
 * O asterisco no lugar da tag indica que tratará o atributo para todas as tags
 */
$atributosProibidos = [
    '*@width',
    '*@height',
    'table@border',
    'table@cellpadding',
    'table@cellspacing',
];

$config = HTMLPurifier_Config::createDefault();

// Remove tags vazias
$config->set('AutoFormat.RemoveEmpty', true);

/*
 * Considera tags somente com espaço em branco e &nbsp; como vazias
 * th e td são exceções a essa regra, mas você pode incluí-los
 */
$config->set('AutoFormat.RemoveEmpty.RemoveNbsp', true);

// Remove span sem atributos
$config->set('AutoFormat.RemoveSpansWithoutAttributes', true);

// Propriedades permitidas para o CSS inline
$config->set('CSS.AllowedProperties', $CssPropriedadesPermitidas);

// Classes permitidas nas tags
$config->set('Attr.AllowedClasses', $classesPermitidas);

// Tags que não podem ser utilizadas
$config->set('HTML.ForbiddenElements', $tagsProibidas);

// Atributos que não podem ser utilizados
$config->set('HTML.ForbiddenAttributes', $atributosProibidos);

// Quebra de linha independente do SO
$config->set('Output.Newline', "\n");

// O nível de análise para a troca dos elementos descontinuados
$config->set('HTML.TidyLevel', 'heavy');
```

## As transformações do HTML Purifier

Se você prestou atenção nas configurações deve ter notado a `HTML.TidyLevel`.

O HTML Purifier utiliza essa configuração para substituir as tags e atributos descontinuados por tags e atributos atualizados. Ou seja, ele pega um HTML assim:

```html
<p align="center" bgcolor="#FFFFFF">Centralizado e Branco</p>
<center>Centralizado!</center>
<p><strike>Tachado</strike></p>
<p><font size="2" color="#000000">Tag font?</font></p>
```

E deixa assim:

```html
<p style="text-align:center; background-color: #FFFFFF">Centralizado e Branco</p>
<div style="text-align:center">Centralizado!</div>
<p style="text-decoration:line-through">Tachado</p>
<p><span style="font-size:small; color:#000000">Tag font?</span></p>
```

A ótima notícia é que podemos usar a ferramenta de análise e transformação do HTML Purifier para fazer as nossas modificações.

Podemos personalizar as definições do HTML, olha só a [documentação de personalização](http://htmlpurifier.org/docs/enduser-customize.html), mas isso é tema pra outro post. Por enquanto usar as transformações é o suficiente.

### Transformando atributos

Para alterar os atributos basta criar uma classe que estenda a `HTMLPurifier_AttrTransform` e implemente o método `transform`, o qual recebe os atributos da tag, além da configuração e contexto, realiza as mudanças e então retorna os atributos.

No diretório `library/HTMLPurifier/AttrTransform` há várias classes utilizadas pelo HTML Purifier e que podemos usar como exemplo.

Olhe a classe que transforma o atributo bgColor em CSS Inline equivalente.

```php
<?php

/**
 * Pre-transform that changes deprecated bgcolor attribute to CSS.
 */
class HTMLPurifier_AttrTransform_BgColor extends HTMLPurifier_AttrTransform
{
    /**
     * @param array $attr
     * @param HTMLPurifier_Config $config
     * @param HTMLPurifier_Context $context
     * @return array
     */
    public function transform($attr, $config, $context)
    {
        if (!isset($attr['bgcolor'])) {
            return $attr;
        }

        // Remove o atributo do array e retorna o seu valor
        $bgcolor = $this->confiscateAttr($attr, 'bgcolor');

        // Adiciona o CSS inline no atributo style
        $this->prependCSS($attr, "background-color:$bgcolor;");
        
        return $attr;
    }
}
```

### Transformando tags

De forma semelhante às transformações de atributos podemos realizar transformações completas nas tags.

Podemos criar uma classe que estenda a `HTMLPurifier_TagTransform` e que implemente o método `transform`, o qual recebe a tag, a configuração e o contexto.

No diretório `library/HTMLPurifier/TagTransform` há duas classes utilizadas pelo HTML Purifier, a classe que transforma a tag **font** e uma classe mais "genérica" que trata todas as outras transformações simples, a `HTMLPurifier_TagTransform_Simple`.

```php
<?php

// Troca toda tag u por um <span style="text-decoration:underline">
$config_da_tag_u = new HTMLPurifier_TagTransform_Simple(
    'span',
    'text-decoration:underline;'
);
```
Veja a classe `HTMLPurifier_TagTransform_Simple`:

```php
<?php

/**
 * Simple transformation, just change tag name to something else,
 * and possibly add some styling. This will cover most of the deprecated
 * tag cases.
 */
class HTMLPurifier_TagTransform_Simple extends HTMLPurifier_TagTransform
{
    /**
     * @var string
     */
    protected $style;

    /**
     * @param string $transform_to Tag name to transform to.
     * @param string $style CSS style to add to the tag
     */
    public function __construct($transform_to, $style = null)
    {
        $this->transform_to = $transform_to;
        $this->style = $style;
    }

    /**
     * @param HTMLPurifier_Token_Tag $tag
     * @param HTMLPurifier_Config $config
     * @param HTMLPurifier_Context $context
     * @return HTMLPurifier_Token_Tag
     */
    public function transform($tag, $config, $context)
    {
        // Não altera a $tag original
        $new_tag = clone $tag;

        // Nome é literalmente a tag
        $new_tag->name = $this->transform_to;

        // HTMLPurifier_Token_Start indica uma tag de início. Ex: <table>
        // HTMLPurifier_Token_End indica uma tag de fim. Ex: </table>
        // HTMLPurifier_Token_Empty indica uma tag vazia. Ex: <img />
        if (!is_null($this->style) 
            && (
                $new_tag instanceof HTMLPurifier_Token_Start 
                || $new_tag instanceof HTMLPurifier_Token_Empty
            )
        ) {
            $this->prependCSS($new_tag->attr, $this->style);
        }
        
        return $new_tag;
    }
}
```

### Configurando o HTML Purifier para usar as transformações

Depois de entender como as classes funcionam precisamos entender como passá-las ao HTML Purifier.

Toda a configuração das transformações ficam nas definições do HTML. Para pegar as definições basta usar o método `getHTMLDefinition` na **$config** e você receberá uma instância da `HTMLPurifier_HTMLDefinition`.

Nesse objeto de definições há 3 propriedades públicas que recebem as nossas instâncias de transformações.

- **info_tag_transform** é um array cujo índice é o nome da tag a transformar
- **info_attr_transform_pre** é um array de índice numérico que transformará os atributos no início do processo
- **info_attr_transform_post** é um array de índice numérico que transformará os atributos no final do processo

Seguindo os nossos exemplos teríamos algo assim:

```php

$htmlDefinition = $config->getHTMLDefinition();

// Transformaria toda tag p em uma tag div com CSS inline para deixar o texto com sublinhado
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

Para adicionar as classes padrões que não dependem de alguma verificação criei uma classe genérica baseada na classe `HTMLPurifier_TagTransform_Simple`.

```php
<?php

/**
 * Change class attr.
 */
class TagClassTransform extends HTMLPurifier_TagTransform
{
    /**
     * @var array
     */
    protected $classes = [];

    /**
     * @param string[]|string $classes Classes to set in the tag
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
     * @param string $classes
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

$purifier = new HTMLPurifier($config);
```

Isso já é o suficiente para converter esse HTML:

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

Precisamos fazer a troca do atributo **border**, independente do seu valor, pela classe **table-bordered**. Para isso basta criar uma classe estendendo a `HTMLPurifier_AttrTransform` e então adicionar uma instância dela ao array `$htmlDefinition->info_attr_transform_pre`.

```php
<?php

/**
 * Pre-transform that changes border attribute to table-bordered class.
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
         * quando for a tag table
         */
        if (!isset($attr['border']) || $context->get('CurrentToken')->name !== 'table') {
            return $attr;
        }

        unset($attr['border']);

        if (empty($attr['class'])) {
            $attr['class'] = '';
        }

        $attr['class'] = $this->appendClasses($attr['class']);
        
        return $attr;
    }

    /**
     * @param string $classes
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

Ficou assim:

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

Agora falta cercar a tabela com uma **div.table-responsive**.

## Criando um wrapper para a tabela

Agora é hora de bater um pouco a cabeça. Como usar a transformação para criar um wrapper na nossa tabela?

Simplesmente não vamos utilizar, afinal não queremos transformar uma table e sim inserir algo antes e depois dela.

O HTML Purifier usa a classe `HTMLPurifier_Injector` para fazer inserções no HTML. Por exemplo a opção `AutoFormat.Linkify` usa injector para inserir a tag **a** com o atributo **href** em torno de um texto que case com a regra de URL.

Utilizar injector é mais complexo do que uma TagTransform por que você analisará os tokens que formam o HTML, mas é possível resolver mais fácil do que os quebra-cabeças do novo filme da Lara Croft. Dê uma olhada no diretório `library\HTMLPurifier\Injector` e ficará surpreso com as inserções que o Purifier já possui.

Olha só como é o Injector que trata de converter textos com http, https e ftp para links:

```php
<?php

/**
 * Injector that converts http, https and ftp text URLs to actual links.
 */
class HTMLPurifier_Injector_Linkify extends HTMLPurifier_Injector
{
    /**
     * @var string
     */
    public $name = 'Linkify';

    /**
     * @var array
     */
    public $needed = array('a' => array('href'));

    /**
     * @param HTMLPurifier_Token $token
     */
    public function handleText(&$token)
    {
        if (!$this->allowsElement('a')) {
            return;
        }

        if (strpos($token->data, '://') === false) {
            // our really quick heuristic failed, abort
            // this may not work so well if we want to match things like
            // "google.com", but then again, most people don't
            return;
        }

        // there is/are URL(s). Let's split the string.
        // We use this regex:
        // https://gist.github.com/gruber/249502
        // but with @cscott's backtracking fix and also
        // the Unicode characters un-Unicodified.
        $bits = preg_split(
            '/\\b((?:[a-z][\\w\\-]+:(?:\\/{1,3}|[a-z0-9%])|www\\d{0,3}[.]|[a-z0-9.\\-]+[.][a-z]{2,4}\\/)(?:[^\\s()<>]|\\((?:[^\\s()<>]|(?:\\([^\\s()<>]+\\)))*\\))+(?:\\((?:[^\\s()<>]|(?:\\([^\\s()<>]+\\)))*\\)|[^\\s`!()\\[\\]{};:\'".,<>?\x{00ab}\x{00bb}\x{201c}\x{201d}\x{2018}\x{2019}]))/iu',
            $token->data, -1, PREG_SPLIT_DELIM_CAPTURE);


        $token = array();

        // $i = index
        // $c = count
        // $l = is link
        for ($i = 0, $c = count($bits), $l = false; $i < $c; $i++, $l = !$l) {
            if (!$l) {
                if ($bits[$i] === '') {
                    continue;
                }
                $token[] = new HTMLPurifier_Token_Text($bits[$i]);
            } else {
                $token[] = new HTMLPurifier_Token_Start('a', array('href' => $bits[$i]));
                $token[] = new HTMLPurifier_Token_Text($bits[$i]);
                $token[] = new HTMLPurifier_Token_End('a');
            }
        }
    }
}
```

Basicamente a `HTMLPurifier_Injector` possui 3 métodos para trabalhar com os tokens analisados.

- **handleText**: chamado quando o token é um texto
- **handleElement**: chamado quando o token é uma tag de início ou vazia
- **handleEnd**: chamado quando o token é uma tag de fim

Todos os métodos recebem uma referência de `HTMLPurifier_Token` que será modificado caso queira adicionar algo. Geralmente será convertido em um array e então adicionará tokens neste array na sequência necessária.

Caso a **HTMLPurifier_Injector_Linkify** encontre um texto que atenda a regra de URL ela transforma o Token em um array e insere os elementos na sequência. Ela cria um `HTMLPurifier_Token_Start` da tag **a** com o atributo **href**, então um `HTMLPurifier_Token_Text` com o texto e fecha a tag criando o token `HTMLPurifier_Token_End`.

É importante observar as propriedades `name` e `needed` da `HTMLPurifier_Injector`. A propriedade `name` indica o nome do seu injector e a `needed` indica quais tags e atributos são necessários para ela funcionar (a `HTMLPurifier_Injector` identifica o `needed` e caso exista alguma regra que proíba as tags e atributos já cancela a sua execução).

Para adicionar o Linkify poderíamos fazer isso:

```php
<?php

$htmlDefinition->info_injector[] = new HTMLPurifier_Injector();
```
 Mas é claro que o melhor é utilizar a configuração `AutoFormat.Linkify` ao invés de passar manualmente.

 Nosso injector ficou assim:

 ```php
 <?php

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

## Algumas dicas extras

Use o HTML Purifier antes de persistir os dados (indiferente se utilizar arquivos ou banco de dados), pois o processo de analisar e converter o HTML é custoso e não deve ser executado todas as vezes que for exibir na tela. Então o melhor é já salvar limpo.

Reduza o HTML antes de salvá-lo para economizar espaço. Durante esse processo eu utilizei a [Tiny Html Minifier](https://github.com/jenstornell/tiny-html-minifier) e gostei do resultado.
