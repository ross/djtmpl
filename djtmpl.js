(function () {
    djtmpl = this.djtmpl || {};

    function is_defined(x) {
        return typeof(x) !== 'undefined';
    }

    function find_val(data, name) {
        var ret = '';
        if (is_defined(data)) {
            try {
                ret = eval('data.' + name);
                if (!is_defined(ret)) {
                    ret = '';
                }
            } catch (e) {
            }
        }
        return ret;
    }

    var filter_funcs = {
        lower: function(s) {
            return s.toLowerCase(s);
        },
        upper: function(s) {
            return s.toUpperCase(s);
        },
        capfirst: function(s) {
            return s[0].toUpperCase() + s.substr(1);
        }
    };

    function render_variable(token, data) {
        // TODO: support for filter parameters
        return token.replace(/{{\s*([\w\.]*)([\|\w]+)?\s*}}/g,
                            function (all, match, filters) {
            var ret = find_val(data, match);
            if (is_defined(filters)) {
                filters = filters.split(/\|/);
                for (var i in filters) {
                    var filter = filters[i];
                    filter = filter_funcs[filter];
                    if (filter) {
                        ret = filter(ret);
                    }
                }
            }
            return ret;
        });
    }

    function render_block(block, data) {
        var ret = '';
        var token = block.shift();
        while (is_defined(token)) {
            if (token[1] === '%') {
                // tags
                var tag = token.match(/{%\s*(for|if)/);
                if (tag && tag.length > 0) {
                    if (tag[1] === 'for') {
                        ret += render_for(token, block, data);
                    } else if (tag[1] === 'if') {
                        ret += render_if(token, block, data);
                    }
                }
            } else if (token[1] === '{') {
                // variable
                ret += render_variable(token, data);
            } else {
                // literal
                ret += token;
            }
            token = block.shift();
        }
        return ret;
    }

    var endfor_regex = /^{%\s+endfor/;
    var for_regex = /for (\w+) in ([.\w]+)/;

    function render_for(token, tokens, data) {
        // look for endfor
        var block = [];
        var next = tokens.shift();
        while (is_defined(next) && !('' + next).match(endfor_regex)) {
            block.push(next);
            next = tokens.shift();
        }
        var ret = '';
        if (is_defined(next) && next.match(endfor_regex)) {
            var pieces = token.match(for_regex);
            if (pieces) {
                var array = find_val(data, pieces[2]);
                for (var i in array) {
                    var d = {};
                    d[pieces[1]] = array[i];
                    ret += render_block(block.slice(0), d);
                }
            }
        } // TODO: we didn't find the endfor
        return ret;
    }

    var endif_regex = /^{%\s+endif/;
    var if_regex = /if ([.\w]+)/;

    // TODO: look at combining/generalizing for and if handling
    function render_if(token, tokens, data) {
        // look for endif
        var block = [];
        var next = tokens.shift();
        while (is_defined(next) && !('' + next).match(endif_regex)) {
            block.push(next);
            next = tokens.shift();
        }
        var ret = '';
        if (is_defined(next) && next.match(endif_regex)) {
            var pieces = token.match(if_regex);
            if (pieces) {
                var bool = find_val(data, pieces[1]);
                if (bool) {
                    ret += render_block(block, data);
                }
            }
        } // TODO: we didn't find the endif
        return ret;
    }

    djtmpl = {
        render: function(tmpl, data) {
            if (tmpl) {
                // TODO: we shouldn't support newlines inside of tags
                var block = tmpl.split(/({[{%].*?[%}]})/);
                return render_block(block, data);
            }
            return '';
        }
    };
}());

