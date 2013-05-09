var PointerController = Class.extend({
    init: function() {
        this.objects = new goog.structs.Map;
    },
    CheckID: function(id) {
        if (this.objects.get(id)) {
            return true;
        }
        else {
            this.objects.set(id, 1);

            return false;
        }
    },
    AttrPointer: function(HTMLUID, UID) {
        if (this.CheckID(HTMLUID) == true) {
            return;
        }

        var attr = new Pointer(HTMLUID, UID);

        attr
                .bind('move', function(event) {
            event.HTMLel.css({
                top: event.EndY - 10,
                left: event.EndX - 10
            });
        });

        return attr;
    },
    ImagePointer: function(id, uid) {
        if (this.CheckID(uid) == true) {
            return;
        }

        var drag = new Pointer(id, uid);
        drag.bind('pointerclick', function(event) {
            if ($(event.target).prop("tagName") === 'IMG') {
                var uid = event.uid;
                var DO = DataElements.get(uid);

                DO.ToggleAttrsList();
            }
        }).bind('pointerdoubleclick', function(event) {
            if ($(event.target).prop("tagName") === 'IMG') {
                var uid = event.uid;
                var DO = DataElements.get(uid);

                var c = DO.GetCurrentContainer();
                if (c && c !== 'list') {
                    DO.Tooltip.Remove();
                    window.open(DO.GetURL());
                    self.focus();
                }
            }
        }).bind('dragend', function(event) {
            var uid = event.uid;
            var DO = DataElements.get(uid);

            if (DO)
            {
                DO.ContainerCreated = 0;
                DO.GP = null;
                DO.CreateGP();
                DO.RefreshPosition();

                var is_dropped = false;

                is_dropped |= Horizon.DropIn(event.EndX + event.ScrollLeft, event.EndY + event.ScrollTop, event.id);
                is_dropped |= GravityTrap.IsDropped(event.EndX + event.ScrollLeft, event.EndY + event.ScrollTop, DO);
                is_dropped |= FeedPanel.InWormhole(event.EndX + event.ScrollLeft, event.EndY + event.ScrollTop, DO);
                //is_dropped |= Containers.DropIn(event.EndX + event.ScrollLeft, event.EndY + event.ScrollTop, DO);

                if (is_dropped) {
                    DO.HideAttrsList();
                }
                else {
                    DO.ShowAttrsList();
                }
            }
        }).bind('move', function(event) {
            var uid = event.uid;
            var DE = DataElements.get(uid);

            var x = event.EndX - 15 + $(document).scrollLeft();
            var y = event.EndY - 15 + $(document).scrollTop();

            DE.Reposition(x, y);

            LandingZones.CheckZones(DE, event.EndX + event.ScrollLeft, event.EndY + event.ScrollTop);
        });
    },
    ContainerPointer: function(id) {
        if (this.CheckID(id) == true) {
            return;
        }

        var drag = new Pointer(id);
        drag
                .bind('dragend', function(event) {
            var cont = Containers.get(event.id.replace('clickarea_container_', ''));

            if (cont.ResultPointContainers) {
                cont.IsMoved = 1;
            }

            GravityTrap.onLeave(cont);
            //FeedPanel.onLeave(cont);

            if (cont.GetContainerType() == App.CONTAINER_TYPE_LOAD && !cont.GetIsLoaded()) {
                Input.LoadElementsFromFeed(cont, cont.GetFeedID());
            }

            if (cont.ContainerType != App.CONTAINER_TYPE_INPUT) {
                cont.Arrange();
            }

            GravityTrap.IsDropped(event.EndX + event.ScrollLeft, event.EndY + event.ScrollTop, cont);
            cont.BoldLines();

            FeedPanel.InWormhole(event.EndX + event.ScrollLeft, event.EndY + event.ScrollTop, cont);
        })
                .bind('move', function(event) {
            var cont = Containers.get(event.id.replace('clickarea_container_', ''));

            var x = event.EndX - 23 + $(document).scrollLeft();
            var y = event.EndY - 23 + $(document).scrollTop();

            cont.Reposition(x, y);

            LandingZones.CheckZones(cont, x, y);

            //            if (FeedPanel.IsInWormhole(x, y)) {
            //                cont.IsActive();
            //            //FeedPanel.ChangeWormholeColor('inside');
            //            }
            //            else {
            //                cont.IsNotActive();
            //            //FeedPanel.ChangeWormholeColor('outside');
            //            }
            //
            //            GravityTrap.CheckPanel(cont, x, y);

            Grouping.Redraw();

            cont.BoldLines();
        });
    },
    ContainerCreatePointer: function(id) {
        if (this.CheckID(id) == true) {
            return;
        }

        var drag = new Pointer(id);
        drag
                .bind('dragend', function(event) {
            var c = Containers.CreateHTMLContainer('default', App.CONTAINER_TYPE_GENERAL);
            c.Reposition(event.clientX + $(document).scrollLeft() - 20, event.clientY + $(document).scrollTop() - 20);

            event.HTMLel.removeAttr('style');
        })
                .bind('move', function(event) {
            event.HTMLel.css({
                top: event.EndY - 45,
                left: event.EndX - 16
            });
        });
    },
    ContainerResize: function(id) {
        if (this.CheckID(id) == true) {
            return;
        }

        var drag = new Pointer(id);
        drag
                .bind('dragend', function(event) {
            event.HTMLel.removeAttr('style');

            var c = Containers.get(event.id.replace('resize_container_', ''));

            var pos = c.HTMLel.position();
            var x = pos.left;
            var y = pos.top;

            var w = event.EndX - x - c.HTMLel.width();
            var h = event.EndY - y - c.HTMLel.height();

            if (c.ContainerType != App.CONTAINER_TYPE_INPUT) {
                c.Resize(c.HTMLel.width() + w, c.HTMLel.height() + h, 1);

                c.Arrange();
            }
        })
                .bind('move', function(event) {
            var c = Containers.get(event.id.replace('resize_container_', ''));

            var pos = c.HTMLel.position();
            var x = pos.left;
            var y = pos.top;

            var w = event.EndX + $(document).scrollLeft() - x - c.HTMLel.width();
            var h = event.EndY + $(document).scrollTop() - y - c.HTMLel.height();

            var res = c.Resize(c.HTMLel.width() + w, c.HTMLel.height() + h, 0);

            x = event.EndX - 15 + $(document).scrollLeft() - x;
            y = event.EndY - 15 + $(document).scrollTop() - y;

            switch (res) {
                case 1:
                    event.HTMLel.css({
                        left: x,
                        top: y
                    });
                    break;
                case 2:
                    event.HTMLel.css({
                        top: y,
                        left: c.HTMLel.width() - 20
                    });
                    break;
                case 3:
                    event.HTMLel.css({
                        left: x,
                        top: c.HTMLel.height() - 20
                    });
                    break;
                case 4:
                    event.HTMLel.css({
                        left: c.HTMLel.width() - 20,
                        top: c.HTMLel.height() - 20
                    });
                    break;
            }

            c.ShowFrame();
            c.Arrange();
        });
    },
    FeedPointer: function(id) {
        if (this.CheckID(id) == true) {
            return;
        }


    },
    FeedLoadPointer: function(id) {
        if (this.CheckID(id) == true) {
            return;
        }
    },
    HorizonPointer: function(id) {
        if (this.CheckID(id) == true) {
            return;
        }
    }
});