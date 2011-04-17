function test_args() {
    equals(djtmpl.render(), '', 'no args');
    equals(djtmpl.render(''), '', 'empty tmpl, no data');
    equals(djtmpl.render('', {}), '', 'empty tmpl, empty data');
    equals(djtmpl.render(undefined, {}), '', 'undefined tmpl, empty data');
    equals(djtmpl.render(undefined, {a: 42}), '', 'undefined tmpl, with data');
}

function test_literals() {
    equals(djtmpl.render(''), '', 'empty template, no data');
    equals(djtmpl.render('', {a: 42}), '', 'empty template, with data');
    equals(djtmpl.render('x'), 'x', 'char template, no data');
    equals(djtmpl.render('x', {a: 42}), 'x', 'char template, with data');
    equals(djtmpl.render('this is a sentence'),
           'this is a sentence', 'sentence template, no data');
    equals(djtmpl.render('this is a sentence', {a: 42}), 'this is a sentence',
           'sentence template, with data');
    equals(djtmpl.render('this is a sentence with some special chars {!@%.}'),
           'this is a sentence with some special chars {!@%.}',
           'sentence template with special chars, no data');
    equals(djtmpl.render('this is a sentence with some special chars {!@%.}',
                         {a: 42}),
           'this is a sentence with some special chars {!@%.}',
           'sentence template with special chars, with data');
}

function test_variables_basic() {
    // TODO: django throws an exception here
    equals(djtmpl.render('{{}}'), '', 'empty variable, no data');
    equals(djtmpl.render('{{}}', {}), '', 'empty variable, empty data');
    equals(djtmpl.render('{{}}', {a: 42}), '', 'empty variable, with data');

    equals(djtmpl.render('{{ }}'), '', 'space variable, no data');
    equals(djtmpl.render('{{ }}', {}), '', 'space variable, empty data');
    equals(djtmpl.render('{{ }}', {a: 42}), '', 'space variable, with data');

    // TODO: django doesn't allow newlines in variables
    equals(djtmpl.render('{{\n}}'), '', 'nl variable, no data');
    equals(djtmpl.render('{{\n}}', {}), '', 'nl variable, empty data');
    equals(djtmpl.render('{{\n}}', {a: 42}), '', 'nl variable, with data');

    equals(djtmpl.render('x{{}}'), 'x', 'literal then empty variable, no data');
    equals(djtmpl.render('x{{}}', {}), 'x',
           'literal then empty variable, empty data');
    equals(djtmpl.render('x{{}}', {a: 42}), 'x',
           'literal then empty variable, with data');

    equals(djtmpl.render('{{}}x'), 'x',
           'empty variable then literal, no data');
    equals(djtmpl.render('{{}}x', {}), 'x',
           'empty variable then literal, empty data');
    equals(djtmpl.render('{{}}x', {a: 42}), 'x',
           'empty variable then literal, empty data');

    equals(djtmpl.render('x{{}}x'), 'xx',
           'empty vairable wrapped in literals, no data');
    equals(djtmpl.render('x{{}}x', {}), 'xx',
           'empty vairable wrapped in literals, empty data');
    equals(djtmpl.render('x{{}}x', {a: 42}), 'xx',
           'empty vairable wrapped in literals, with data');

    equals(djtmpl.render('x{{\n}}x', {a: 42}), 'xx',
           'newline in vairable wrapped in literals, with data');
    equals(djtmpl.render('x{{\t}}x', {a: 42}), 'xx',
           'tab in vairable wrapped in literals, with data');

    equals(djtmpl.render('{{ name }}'), '', 'valid variable, no data');
    equals(djtmpl.render('{{ name }}', {}), '', 'valid variable, empty data');
    equals(djtmpl.render('{{ name }}', {a: 42}), '',
           'valid variable, with data, no match');
    equals(djtmpl.render('{{ name }}', {name: 'john'}), 'john',
           'valid variable, with data, match');

    equals(djtmpl.render('{{ user.name }}'), '', '2-level variable, no data');
    equals(djtmpl.render('{{ user.name }}', {}), '',
           '2-level variable, empty data');
    equals(djtmpl.render('{{ user.name }}', {a: 42}), '',
           '2-level variable, with data, no match');
    equals(djtmpl.render('{{ user.name }}', {user: {a : 42}}), '',
           '2-level variable, with data, no 2nd-level match');
    equals(djtmpl.render('{{ user.name }}', {user: {name: 'john'}}), 'john',
           '2-level variable, with data, match');

    equals(djtmpl.render('x{{ name }}', {name: 'john'}), 'xjohn',
           'prepended variable');
    equals(djtmpl.render('{{ name }}x', {name: 'john'}), 'johnx',
           'appended variable');
    equals(djtmpl.render('x{{ name }}x', {name: 'john'}), 'xjohnx',
           'appended and prepended variable');

}

function test_variables_bad() {
    // TODO: is this what django does? dobut it.

    equals(djtmpl.render('{{'), '{{', 'no close');
    equals(djtmpl.render('}}'), '}}', 'no open');

    equals(djtmpl.render('{{!}}'), '{{!}}', 'bad characters');

    equals(djtmpl.render('{ {} }'), '{ {} }', 'bad spacing');
    equals(djtmpl.render('{ { } }'), '{ { } }', 'more bad spacing');
}

function test_filters_basic() {
    // TODO: django blows up on these
    equals(djtmpl.render('{{|}}'), '', 'just filter');
    equals(djtmpl.render('{{name|}}', {name: 'john'}), 'john', 'variable, empty filter');
    equals(djtmpl.render('{{name||}}', {name: 'john'}), 'john',
           'variable, multiple empty filter');

    // lower
    equals(djtmpl.render('{{name|lower}}', {name: 'john'}), 'john',
           'lower, already');
    equals(djtmpl.render('{{name|lower}}', {name: 'John'}), 'john',
           'lower, initial-cap');
    equals(djtmpl.render('{{name|lower}}', {name: 'JOHN'}), 'john',
           'lower, all-cap');
    equals(djtmpl.render('{{name|lower|lower}}', {name: 'JOHN'}), 'john',
           'lower, lower');

    // upper
    equals(djtmpl.render('{{name|upper}}', {name: 'JOHN'}), 'JOHN',
           'upper, already');
    equals(djtmpl.render('{{name|upper}}', {name: 'John'}), 'JOHN',
           'upper, initial-cap');
    equals(djtmpl.render('{{name|upper}}', {name: 'john'}), 'JOHN',
           'upper, all-cap');
    equals(djtmpl.render('{{name|upper|upper}}', {name: 'john'}), 'JOHN',
           'upper, upper');

    // capfirst
    equals(djtmpl.render('{{name|capfirst}}', {name: 'John'}), 'John',
           'capfirst, already');
    equals(djtmpl.render('{{name|capfirst}}', {name: 'john'}), 'John',
           'capfirst, lower');
    equals(djtmpl.render('{{name|capfirst}}', {name: 'jOHN'}), 'JOHN',
           'capfirst, opposite');
    equals(djtmpl.render('{{name|capfirst}}', {name: 'JOHN'}), 'JOHN',
           'capfirst, all-cap');
    equals(djtmpl.render('{{name|capfirst|capfirst}}', {name: 'john'}), 'John',
           'capfirst, capfirst');
}

function test_tags_for() {
    equals(djtmpl.render('{% for a in b %}'), '', 'no endfor');
    equals(djtmpl.render('{% for a in b %}{% endfor %}'), '', 'empty for');
    equals(djtmpl.render('{%for a in b%}{%endfor%}'), '', 
           'empty for, no spaces');

    equals(djtmpl.render('{% for a in b %}x{% endfor %}'), '', 
           'literal for, no data');
    equals(djtmpl.render('{% for a in b %}x{% endfor %}', {}), '', 
           'literal for, empty data');
    equals(djtmpl.render('{% for a in b %}x{% endfor %}', {b: []}), '', 
           'literal for, empty array');
    equals(djtmpl.render('{% for a in b %}x{% endfor %}', {b: [1]}), 'x', 
           'literal for, array w/1 val');
    equals(djtmpl.render('{% for a in b %}x{% endfor %}', {b: [1, 2]}), 'xx', 
           'literal for, array w/2 vals');
    equals(djtmpl.render('{% for a in b %}x{% endfor %}', 
                         {b: [1, 2, 3, 4, 5]}), 'xxxxx', 
           'literal for, array w/5 vals');

    equals(djtmpl.render('{% for a in b %}{{ a }}{% endfor %}', 
                         {b: [1, 2, 3, 4, 5]}), '12345', 
           'variable for, array w/5 vals');
    equals(djtmpl.render('{% for a in b %}x{{ a }}{% endfor %}', 
                         {b: [1, 2, 3, 4, 5]}), 'x1x2x3x4x5', 
           'literal & variable for, array w/5 vals');

    var array = [{ name: 'z', }, { name: 'y', }, { name: 'x', }, {
        name: 'w', }, { name: 'v', }];
    equals(djtmpl.render('{% for a in b %}{{ a.name }}{% endfor %}', 
                         {b: array}), 'zyxwv', 
           'multi-level variable for, array w/5 vals');

    equals(djtmpl.render('{% for a in b.users %}{{ a.name }}{% endfor %}', 
                         {b: { users: array }}), 'zyxwv', 
           'multi-level variable for, array w/5 vals');

    equals(djtmpl.render('{% for a in b.users %}<li>{{ a.name }}</li>{% endfor %}', 
                         {b: { users: array }}), 
           '<li>z</li><li>y</li><li>x</li><li>w</li><li>v</li>', 
           'multi-level variable for, array w/5 vals');

    equals(djtmpl.render('<ul>{% for a in b.users %}<li>{{ a.name }}</li>{% endfor %}</ul>', 
                         {b: { users: array }}), 
           '<ul><li>z</li><li>y</li><li>x</li><li>w</li><li>v</li></ul>', 
           'multi-level variable for, array w/5 vals');
}

function test_tags_if() {
    // TODO: django blows up here
    equals(djtmpl.render('{% if x %}'), '', 'no endif');
    equals(djtmpl.render('{% endif %}'), '', 'no (start) if');

    equals(djtmpl.render('{% if x %}{% endif %}'), '', 
           'empty if false, no data');
    equals(djtmpl.render('{% if x %}{% endif %}', {}), '', 
           'empty if false, empty data');
    equals(djtmpl.render('{% if x %}{% endif %}', {a: 42}), '', 
           'empty if false, wrong data');
    equals(djtmpl.render('{% if x %}{% endif %}', {x: false}), '', 
           'empty if false, false data');
    equals(djtmpl.render('{% if x %}{% endif %}', {x: true}), '', 
           'empty if true');

    equals(djtmpl.render('{% if x %}a{% endif %}'), '', 
           'literal if false, no data');
    equals(djtmpl.render('{% if x %}a{% endif %}', {}), '', 
           'literal if false, empty data');
    equals(djtmpl.render('{% if x %}a{% endif %}', {a: 42}), '', 
           'literal if false, wrong data');
    equals(djtmpl.render('{% if x %}a{% endif %}', {x: false}), '', 
           'literal if false, false data');
    equals(djtmpl.render('{% if x %}a{% endif %}', {x: true}), 'a', 
           'literal if true');

    equals(djtmpl.render('{% if x %}{{ name }}{% endif %}', 
                         {a: 42, name: 'john'}), '', 
           'variable if false, wrong data');
    equals(djtmpl.render('{% if x %}{{ name }}{% endif %}', 
                         {x: false, name: 'john'}), '', 
           'variable if false, false data');
    equals(djtmpl.render('{% if x %}{{ name }}{% endif %}', 
                         {x: true, name: 'john'}), 'john', 
           'variable if true');

    // TODO: support boolean ops
    // TODO: support else
}

function test_tags_mixed() {
    equals(djtmpl.render('{% for user in users %}{{ user.name }}{% if user.job %} is employeed{% endif %}\n{% endfor %}',
                         { users: [{ name: 'John', job: true }, 
                             { name: 'Bob', job: false }, 
                             { name: 'Jill', job: true }, 
                             { name: 'Jane', job: false } ] }), 
           'John is employeed\nBob\nJill is employeed\nJane\n', 'for with if');

    equals(djtmpl.render('{% if bool %}{% for i in a %}{{ i }}{% endfor %}{% endif %}',
                         {bool: false, a: [1, 2, 3, 4]}), '', 
           'if with for, false');
    equals(djtmpl.render('{% if bool %}{% for i in a %}{{ i }}{% endfor %}{% endif %}',
                         {bool: true}), '', 
           'if with for, true, no data');
    equals(djtmpl.render('{% if bool %}{% for i in a %}{{ i }}{% endfor %}{% endif %}',
                         {bool: true, a: [1, 2, 3, 4]}), '1234', 
           'if with for, true with data');
}

module('General');
test('args', test_args);

module('Literals');
test('literals', test_literals);

module('Variables');
test('basic', test_variables_basic);
test('bad', test_variables_bad);

module('Filters');
test('basic', test_filters_basic);

module('Tags');
test('for', test_tags_for);
test('if', test_tags_if);
test('mixed', test_tags_mixed);
