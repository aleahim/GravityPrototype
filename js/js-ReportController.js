var ReportController = Class.extend({
    init: function() {
        this.reports = 0;
    },

    ShowSumReport: function(container) {
        this.CreateNumReport(container);
    },
    
    ShowReport: function(edit) {
        this.CreateReport(edit);
        this.OpenReport();
    },

    CreateNumReport: function(c) {
        $('#report_container').html('');
        
        var DEs = c.GetElements().arr();
        
        var items = DEs.length;
        var Sum = this.getSum(DEs);
        
        $('#'+c.HTMLid+' .sum').empty();
        $.tmpl('report_num', {
            
            "sum1":Sum.num1,
            "sum2":Sum.num2
        }).appendTo($('#'+c.HTMLid+' .sum'));
	
    },
    
    getSum: function(DEs)
    {
        var sum1 = 0;
        var sum2 = 0;
        $(DEs).each(function(k, v) {
            if (v.num1) {
                sum1 += parseFloat(v.num1);
            }
            if (v.num2) {
                sum2 += parseFloat(v.num2);
            }
        });
        var sum = new Object();
        sum.num1 = sum1;
        sum.num2 = sum2;
        return sum;
    },
    
    OpenReport: function(report_id) {
        window.open('report.html?db=' + App.urlParams['db'] + '&report='+report_id);
        
        App.unblockUI();
    },

    CreateReport: function() {
        Session.Save('report', 'report');
    }
});