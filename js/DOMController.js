var DOMController = Class.extend({
    init: function() {
        this.ClearQ();
        this.ClearEventQ();
    },
    Add: function(DOMel, MOVEUID, UID, x, y) {
        this.q.push(DOMel);
        this.AddEvent(MOVEUID, UID);
    },
    AddEvent: function(MOVEUID, UID, x, y) {
        this.eventQ.push({
            'MOVEUID': MOVEUID,
            'UID': UID,
            'x': x,
            'y': y
        });
    },
    InitEvents: function() {
        for (var a in this.eventQ) {
            var e = this.eventQ[a];

            Events.ImagePointer(e.MOVEUID, e.UID);
            var DO = DataElements.get(e.UID);
            DO.HTMLel = $('#' + e.UID);
          //  DO.Hover();
          //  DO.Out();
            DO.Reposition(e.x, e.y);
        }

        this.ClearEventQ();
    },
    InsertQ: function(parent) {
        if (this.q.length !== 0) {
            $(parent).append(this.q);
        }

        this.ClearQ();

        this.InitEvents();
    },
    ClearQ: function() {
        if (this.q) {
            delete this.q;
        }

        this.q = new Array();
    },
    ClearEventQ: function() {
        if (this.eventQ) {
            delete this.eventQ;
        }

        this.eventQ = new Array();
    }
});