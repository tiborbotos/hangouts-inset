// Copyright (c) 2014 Tibor Botos - https://github.com/tiborbotos
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file. 

if (window.location.toString().indexOf('https://talkgadget.google.com/u/0/talkgadget') == 0) {
    hangoutsInset(jQuery);
}

function hangoutsInset($) {

    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    var chatContainer;

    function checkGtalkContainer() {
        var gtalkMessageDivs = $('div.tk:not[data-chromage-processed]');
        console.log('Found ' + gtalkMessageDivs.length + ' elements!');
    }

    /**
     * Converts the link within the node to an image
     */
	function convertToImageLater(node) {
		setTimeout(function () {
			var url = node.text();
			node.html('<a title="' + url + '" href="' + url + '"><img src="' + url + '" style="width: 100%" /></a> ');

            setTimeout(function () {
                chatContainer.parent().parent().scrollTop(100000000000000000);
            }, 250);
		}, 1000); // timeout needed because of http from https is not allowed
	}

    function initializeObserver() {
        chatContainer = $('div.tk').parent();
        if (chatContainer.length === 1) {
            observer.observe(chatContainer[0], {
                childList: true,
                attributes: false,
                subtree: true
            });

            chatContainer.children().each(function(index, item) {
                var messages = findMessage(item);
                if (typeof messages !== 'undefined') {
                    createInsetFromMessage(messages);
                }
            });
        } else {
            console.log('Chat container cannot be parsed!');
            throw new Error('Chat container cannot be parsed at ' + window.location.toString());
        }
    }

    function initializeObserverFailed() {
        console.log('Failed to resolve chat container!');
    }

    function findMessage(node) {
        var message = $(node).find('div>div>div>div>div+div:not([class])');
        if (message.length == 0) {
            message = $(node).find('div+div:not([class])');
        }
        return (message.length > 0) ?  message : undefined;
    }

    function createInsetFromMessage(messages) {
        $.each(messages, function (index, element) {
            var message = $(element);
            message.addClass('inset-processed');
            console.log('Message: ' + message.text(), message);

            if (message.children() &&
                message.children().length === 1 &&
                $(message.children()[0]).prop('tagName') === 'A' &&
                validImageUrl(message.text())) {

                convertToImageLater(message);
            }
        });
    }

    function mutationObserverHandler(mutations, observer) {
        $.each(mutations, function (index, item){
            if (item.addedNodes && item.addedNodes.length === 1) {
                var node = item.addedNodes[0];
                var messages = findMessage(node);
                if (typeof messages !== 'undefined') {
                    createInsetFromMessage(messages);
                }
            }
        });
    }

    waitFor('body>div>div').done(initializeObserver).fail(initializeObserverFailed);
    var observer = new MutationObserver(mutationObserverHandler);
};

// Utilities
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

function validImageUrl(url) {
    if ((url.indexOf('http://') == 0 || url.indexOf('https://') == 0) && // protocol
		(url.indexOf('.googleusercontent.com/') == -1) && // exclude g+
        (url.indexOf('jpg') > -1 || url.indexOf('jpeg') > -1 || url.indexOf('png') > -1 || url.indexOf('gif') > -1) // file format
		)
        return true;
    else
        return false;
}
