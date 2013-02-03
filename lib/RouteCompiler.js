var _ = require('lodash');
var util = require('util');

/**
 * RouteCompiler compiles Route instances to CompiledRoute instances.
 *
 * @constructor
 */
function RouteCompiler() {

}

/**
 * This string defines the characters that are automatically considered separators in front of
 * optional placeholders (with default and no static text following). Such a single separator
 * can be left out together with the optional placeholder from matching and generating URLs.
 */
RouteCompiler.SEPARATORS = '/,;.:-_~+*=@|';

RouteCompiler.prototype.compile = function (route) {
    var startTime = Date.now();

    var hostnameVariables = [];
    var variables = [];
    var hostnameRegex = null;
    var hostnameTokens = [];
    var result;

    if (route.getHostname()) {
        result = this.compilePattern(route, route.getHostname(), true);

        hostnameVariables = result.variables;
        variables = variables.concat(hostnameVariables);
        hostnameTokens = result.tokens;
        hostnameRegex = result.regex;
    }

    result = this.compilePattern(route, route.getPath(), false);
    var staticPrefix = result.staticPrefix;
    var pathVariables = result.variables;
    variables = variables.concat(pathVariables);
    var tokens = result.tokens;
    var regex = result.regex;

    return new JSymfony.Routing.CompiledRoute(
        staticPrefix,
        regex,
        tokens,
        pathVariables,
        hostnameRegex,
        hostnameTokens,
        hostnameVariables,
        _.uniq(variables)
    );
};

RouteCompiler.prototype.compilePattern = function (route, pattern, isHostname) {
    var i;
    var tokens = [];
    var variables = [];
    var pos = 0;
    var defaultSeparator = isHostname ? '.' : '/';
    // Match all variables enclosed in "{}" and iterate over them. But we only want to match the innermost variable
                // in case of nested "{}", e.g. {foo{bar}}. This in ensured because \w does not match "{" or "}" itself.

    var matches = pattern.match(/\{\w+\}/g) || [];
    for (i = 0; i < matches.length; i++) {
        var match = matches[i];

        var varName = match.slice(1, -1);
        var matchPos = pattern.indexOf(match, pos);
        var precedingText = pattern.substring(pos, matchPos);
        pos = matchPos + match.length;
        var precedingChar = precedingText.slice(-1);
        var isSeparator = precedingChar && this.constructor.SEPARATORS.indexOf(precedingChar) !== -1;
        if (variables.indexOf(varName) !== -1) {
            throw new JSymfony.LogicError(util.format('Route pattern "%s" cannot reference variable name "%s" more than once.', pattern, varName));
        }
        if (isSeparator && precedingText.length > 1) {
            tokens.push(['text', precedingText.slice(0, -1)])
        } else if (!isSeparator && precedingText.length > 0) {
            tokens.push(['text', precedingText]);
        }

        var regexp = route.getRequirement(varName);

        if (!regexp) {
            var followingPattern = pattern.substring(pos);
            // Find the next static character after the variable that functions as a separator. By default, this separator and '/'
            // are disallowed for the variable. This default requirement makes sure that optional variables can be matched at all
            // and that the generating-matching-combination of URLs unambiguous, i.e. the params used for generating the URL are
            // the same that will be matched. Example: new Route('/{page}.{_format}', array('_format' => 'html'))
            // If {page} would also match the separating dot, {_format} would never match as {page} will eagerly consume everything.
            // Also even if {_format} was not optional the requirement prevents that {page} matches something that was originally
            // part of {_format} when generating the URL, e.g. _format = 'mobile.html'.
            var nextSeparator = this.findNextSeparator(followingPattern);
            regexp = util.format('[^%s%s]+',
                                 JSymfony.fn.regexpQuote(defaultSeparator),
                                 (defaultSeparator !== nextSeparator && nextSeparator) ? JSymfony.fn.regexpQuote(nextSeparator) : ''
            );
            /*
            if ((nextSeparator && !/^\{\w+\}/.test(followingPattern)) || !followingPattern) {
                // When we have a separator, which is disallowed for the variable, we can optimize the regex with a possessive
                // quantifier. This prevents useless backtracking of PCRE and improves performance by 20% for matching those patterns.
                // Given the above example, there is no point in backtracking into {page} (that forbids the dot) when a dot must follow
                // after it. This optimization cannot be applied when the next char is no real separator or when the next variable is
                // directly adjacent, e.g. '/{x}{y}'.

                regexp += '+'; //possessive quantifiers doesn't work in javascript
            }*/
        }

        tokens.push(['variable', isSeparator ? precedingChar : '', regexp, varName]);
        variables.push(varName);
    }

    if (pos < pattern.length) {
        tokens.push(['text', pattern.substring(pos)]);
    }

    var firstOptional = Number.MAX_VALUE;

    if (!isHostname) {
        for (i = tokens.length -1; i >= 0; i--) {
            var token = tokens[i];
            if (token[0] === 'variable' && route.hasDefault(token[3])) {
                firstOptional = i;
            } else {
                break;
            }
        }
    }

    regexp = '';
    for (i = 0; i < tokens.length; i++) {
        regexp += this.computeRegexp(tokens, i, firstOptional);
    }

    return {
        staticPrefix: 'text' === tokens[0][0] ? tokens[0][1] : '',
        regex: new RegExp('^' + regexp + '$'),
        tokens: tokens.reverse(),
        variables: variables
    }
};

RouteCompiler.prototype.findNextSeparator = function(pattern) {
    if (!pattern) {
        return '';
    }
    pattern = pattern.replace(/\{\w+\}/, '');
    return pattern && this.constructor.SEPARATORS.indexOf(pattern[0]) !== -1 ? pattern[0] : '';
};

RouteCompiler.prototype.computeRegexp = function(tokens, index, firstOptional) {
    var token = tokens[index];

    if ('text' === token[0]) {
        return JSymfony.fn.regexpQuote(token[1]);
    }

    if (index === 0 && firstOptional === 0) {
        // When the only token is an optional variable token, the separator is required
        return util.format('%s(%s)?', JSymfony.fn.regexpQuote(token[1]), token[2]);
    }

    var regexp = util.format('%s(%s)', JSymfony.fn.regexpQuote(token[1]), token[2]);
    if (index >= firstOptional) {
        // Enclose each optional token in a subpattern to make it optional.
        // "?:" means it is non-capturing, i.e. the portion of the subject string that
        // matched the optional subpattern is not passed back.
        regexp = "(?:" + regexp;
        if (tokens.length - 1 == index) {
            // Close the optional subpatterns
            for (var i = 0; i < tokens.length - firstOptional - (0 === firstOptional ? 1 : 0); i++) {
                regexp += ")?";
            }
        }
    }
    return regexp;
};


JSymfony.Routing.RouteCompiler = module.exports = RouteCompiler;
