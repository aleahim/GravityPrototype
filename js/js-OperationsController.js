var OperationsController = Class.extend({
    init: function() {
    },

    CreateYTPlaylist: function() {
        var videos = new Array();

        var items = GravityTrap.GetTrappedElements();

        for (var a in items)
        {
            var DE = items[a];

            var openurl = DE.GetURL();

            if (openurl.search('youtube.com') != -1) {
                var urlstr = /watch\?v=(.*?)\&|$/;
                urlstr = urlstr.exec(openurl);
                console.log(urlstr);
                if (urlstr && urlstr[1]) {
                    videos.push(urlstr[1]);
                }
            }
        }

        if (videos.length) {
            window.open('http://apps.elido.info/yt/index.php?videos=' + videos.join('@delim@'));
        }
    },

    PostToFB: function(methodType) {
        var url = prompt("Enter link:","");

        if (!url) {
            alert('You must enter link.');
            return;
        }

        var items = GravityTrap.GetTrappedElements();

        for (var a in items)
        {
            var DE = items[a];

            var openurl = DE.GetURL();

            if (openurl.search('facebook.com') != -1) {
                var urlstr = /com\/(.*?)$/;
                urlstr = urlstr.exec(openurl);
                if (urlstr && urlstr[1]) {
                    FB.ui({
                        appId: '319311268160283',
                        method: methodType,
                        to: urlstr[1],
                        link: url,
                        display: 'popup',
                        redirect_uri: 'http://apps.elido.info/fb/post/'
                    });
                }
            }
        }
    },

    OpenParsed: function(url)
    {
        var items = GravityTrap.GetTrappedElements();

        for (var a in items)
        {
            var DE = items[a];

            var openurl = DE.GetURL();

            if (openurl.search('news.google.com') != -1) {
                var urlstr = /url=(.*)/;
                urlstr = urlstr.exec(openurl);
                if (urlstr && urlstr[1]) openurl = urlstr[1];
            }

            window.open(url.replace('[object.url]', escape(openurl)));
            self.focus();
        }
    },

    GDriveFolderAdd: function() {
        var folder = prompt("Enter folder:","");

        if (!folder) {
            alert('You must enter folder.');
            return;
        }

        var items = GravityTrap.GetTrappedElements();

        for (var a in items)
        {
            var DE = items[a];

            if (DE.GetURL().search('docs.google.com') == -1) {
                continue;
            }
            var filename = DE.GetTitle();

        $.post(gateway + "&do=gdrive_addfolder", {
            'filename' : filename,
            'folder' : folder
        }, function(data) {
            console.log(data);
        });
        }
    }
});