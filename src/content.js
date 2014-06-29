if (window.location.toString().indexOf('https://talkgadget.google.com/u/0/talkgadget') == 0) {
    chromage(jQuery);
}

function chromage($) {
    console.log('Execute Chromage! on ' + window.location);
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    function checkGtalkContainer() {
        var gtalkMessageDivs = $('div.tk:not[data-chromage-processed]');
        console.log('Found ' + gtalkMessageDivs.length + ' elements!');
    }

    var observer = new MutationObserver(function(mutations, observer) {
        $.each(mutations, function (index, item){
            if (item.addedNodes && item.addedNodes.length === 1) {
                var node = item.addedNodes[0];
                var message = $(node).find('div>div>div>div>div+div:not([class])');
                if (message.length == 0) {
                    message = $(node).find('div+div:not([class])');
                }
                if (message.length > 0) {
                    $(message[0]).addClass('chromaged');
                    console.log('Message: ' + message.text(), message);

                    if (message.children() &&
                        message.children().length === 1 &&
                        $(message.children()[0]).prop('tagName') === 'A' &&
                        validImage(message.text())) {

                        convertToImageLater(message);
                    }
                }
            }

        });
        // ...
    });

    waitFor('body>div>div').done(function () {
        var chatContainer = $('div.tk').parent();
        if (chatContainer.length === 1) {
            observer.observe(chatContainer[0], {
                childList: true,
                attributes: false,
                subtree: true
            });
        }
    }).fail(function () {
        console.log('Failed to resolve chat container!');
    });
};

function waitFor(selector) {
    var deferred = new jQuery.Deferred();
    var tries = 0;

    var checker = setInterval(function () {
        tries += 1;
        if ($(selector).length > 0) {
            deferred.resolve();
            clearInterval(checker);
        }
        if (tries > 20) {
            deferred.reject();
            clearInterval(checker);
        }
    }, 500);

    return deferred.promise();
}

function validImage(url) {
    if ((url.indexOf('http://') == 0 || url.indexOf('https://') == 0) &&
        (url.indexOf('jpg') > -1 || url.indexOf('jpeg') > -1 || url.indexOf('png') > -1 || url.indexOf('gif') > -1))
        return true;
    else
        return false;
}

function convertToImageLater(node) {
    setTimeout(function () {
        var url = node.text();
        node.html('<a href="' + url + '"><img src="' + url + '" style="width: 100%" /></a> ')
    }, 1000); // timeout needed because of http from https is not allowed
}