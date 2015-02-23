define(['text!pageTemplate', 'underscore'], function (pageTemplate, _) {

    var compiledPage = _.template(pageTemplate);

    return function (options) {
        return compiledPage(options);
    };

});