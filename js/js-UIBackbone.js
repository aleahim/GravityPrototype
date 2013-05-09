var UIBackbone = Class.extend({
    init: function() {
        this.UImap = new goog.structs.Map;
        this.TPLmap = new goog.structs.Map;
        this.OBJmap = new goog.structs.Map;

        var classesToUpdate = new Array('FeedElement');

        for (var a in classesToUpdate) {
            var className = classesToUpdate[a];

            this.UpdateClass(className);
        }
    },

    ScanTemplate: function(obj, tplID) {
        var self = this;
        //var tplID = obj.GetUID();

        this.TPLmap.set(tplID, obj.GetUID());
        this.OBJmap.set(obj.GetUID(), tplID);
        
        var HTMLchildren = $('#'+tplID).find('*[bindChange]');

        var properties = new Array();

        $.each(HTMLchildren, function(k,v) {
            var HTMLchild = v;

            var uid = App.GetNewUID();

            HTMLchild = $(HTMLchild);
            HTMLchild.attr('id', uid);

            var property = HTMLchild.attr('bindChange');

            properties.push(self.SetBind(tplID, property, uid));
        });
        
        for (var a in properties) {
            var property = properties[a];
            
            obj['Set'+property](obj['Get'+property]());
        }
    },

    GetChild: function(objUID, propertyName) {
        var bindcheck = this.UImap.get(objUID);

        if (bindcheck) {
            return bindcheck.get(propertyName);
        }

        return null;
    },

    GetParent: function(childUID) {
        return this.UImap.get(childUID);
    },

    SetBind: function(uid, property, eluid) {
        var bind = this.UImap.get(uid);

        if (!bind) {
            bind = new goog.structs.Map;
        }

        bind.set(property, eluid);
        
        this.UImap.set(uid, bind);
        this.UImap.set(eluid, uid);

        return property;
    },

    UpdateClass: function(className) {
        for (var methodName in window[className].prototype) {
            if ((typeof window[className].prototype[methodName] === "function") && methodName.indexOf('Set') == 0) {
                this.UpdateMethod(className, methodName);
            }
        }
    },

    UpdateMethod: function(className, methodName) {
        var obj = this;

        var original = window[className].prototype[methodName];

        window[className].prototype[methodName] = function(value) {
            original.call(this, value);

            var property = methodName.replace('Set', '');

            var tplID = obj.OBJmap.get(this.GetUID());
            var bindcheck = obj.UImap.get(tplID);

            if (bindcheck) {
                var uid = bindcheck.get(property);

                if (uid) {
                    var el = $('#'+uid);

                    if (el.length) {
                        value = window[className].prototype['Get'+property].call(this);
                        
                        switch (el.prop("tagName")){
                            case 'IMG':
                                el.attr('src', value);
                                break;
                            default:
                                el.html(value);
                                break;
                        }
                    }
                    else {
                        console.log('Error with synching value of object: ' + this.GetUID() + '; property: ' + property + ' and template element: ' + uid);
                    }
                }
            }
        }
    }
});