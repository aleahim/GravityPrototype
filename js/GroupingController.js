var GroupingController = Class.extend({
    init: function() {
        this.matches = new goog.structs.Map;
        this.destinations = new Array();
    },
    SetWorkspace: function(workspace) {
        this.workspace = workspace;
    },
    GetActiveGPs: function() {

    },
    GetActiveDOs: function() {

    },
    CheckExpression: function(DO, GP) {

    },
    SaveMatch: function(DO, GP, exprResult) {
        var match = this.matches.get(DO.GetUID());
        if (match) {
            match.GPs.push({
                'GP': GP,
                'exprResult': exprResult
            });
        }
        else {
            match = new Object();
            match.GPs = [{
                    'GP': GP,
                    'exprResult': exprResult
                }];
            match.DO = DO;
            this.matches.set(DO.GetUID(), match);
        }
    },
    SaveDestination: function(DO, GP) {
        this.destinations.push({
            'DO': DO,
            'GP': GP
        });
    },
    CreateMiddleGPs: function() {
        var matches = this.matches.getValues();
        for (var a in matches) {
            var match = matches[a];
            if (match.GPs.length !== 1) {
                var GP = this.CreateMiddleGP(match);
                this.SaveDestination(match.DO, GP);
            }
            else {
                this.SaveDestination(match.DO, match.GPs[0]);
            }
        }
    },
    CreateMiddleGP: function(match) {
        var x = 0;
        var y = 0;
        var connectedGPs = new Array();
        var attributes = new Array();
        for (var a in match.GPs) {
            var GP = match.GPs[a].GP;
            var exprResult = match.GPs[a].exprResult;

            connectedGPs.push(GP.GetUID());

            x += GP.GetX();
            y += GP.GetY();

            for (var b in exprResult.attributes) {
                var attr = exprResult.attributes[b];

                attributes.push(attr);
            }
        }
        connectedGPs.sort();
        var resultPointUID = connectedGPs.join('_');
        var divider = match.GPs.length;
        x /= divider;
        y /= divider;
        var c = Containers.FindByResultPoint(resultPointUID);
        if (!c) {
            c = Containers.CreateHTMLContainer(resultPointUID, App.CONTAINER_TYPE_MIDDLE);
            c.SetResultPoint(resultPointUID);
            c.SetWorkspace(this.workspace);
            c.SetConnectedContainers(connectedGPs);
            c.DisableButton('group');
        }

        c.Show();
        if (!c.IsMoved) {
            c.Reposition(x, y);
        }
        ContainerUID = c.GetUID();
        var attrs_middle = mv.info.split(",");
        for (var i in attrs_middle) {
            attr = GravityElements.GetAttr(attrs_middle[i]);
            GravityElements.add(attr);
            c.AddAttribute(attr);
            c.SelectAttribute(attr.GetUID());
            c.SortAttributes();
        }

        var RPM = new Object();
        RPM.ContainerUID = ContainerUID;
        RPM.ResultPointContainers = mv.ResultPointContainers;
        c.SetConnectedTo(mv.ResultPointContainers);
        for (var i in mv.ResultPointContainers) {

            var Cont = Containers.get(mv.ResultPointContainers[i]);
            var connected = Cont.GetConnectedTo();
            Cont.SetConnectedTo(connected.concat([ContainerUID]));
        }
        RPM.color = c.GetColor();
    },
    GetVector: function(destination) {

    },
    Move: function() {
        if (this.destinations)
    },
    Group: function(workspace) {
        this.SetWorkspace(workspace);
        var GPs = this.GetActiveGPs();
        var DOs = this.GetActiveDOs();
        for (var a in DOs) {
            var DO = DOs[a];
            for (var b in GPs) {
                var GP = GPs[b];
                var exprResult = this.CheckExpression(DO, GP);
                if (exprResult) {
                    this.SaveMatch(DO, GP, exprResult);
                }
            }
        }

        this.CreateMiddleGPs();
        this.Move();
    }
});