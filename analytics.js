$(document).ready(function() {
    var analytics_header = $('.analytics-header');
    var analytics_info = $('.analytics-main-info.block');
    var analytics_tables = $('.analytics-tables-group');
    var table_parking = analytics_tables.find('[data-attr="info-about-parking"]');
    var table_parking_with_dates = analytics_tables.find('[data-attr="info-about-parking-with-dates"]');
    var totalMoneyBlock = analytics_info.find('[data-attr="totalMoney"]');
    var totalPaymentBlock = analytics_info.find('[data-attr="totalPayment"]');
    var percentOfAmountPaymentBlock = analytics_info.find('[data-attr="percentOfAmountPayment"]');
    var totalOverduePaymentBlock = analytics_info.find('[data-attr="totalOverduePayment"]');
    var totalRemainderBlock = analytics_info.find('[data-attr="totalRemainder"]');
    var avgByOnePhoneBlock = analytics_info.find('[data-attr="avgByOnePhone"]');
    var avgByOneParkingBlock = analytics_info.find('[data-attr="avgByOneParking"]');
    var widget_date_from = analytics_header.find('[name=from_date]');
    var filter_button = analytics_header.find('[data-attr="filter_out"]');
    var filter_reset = analytics_header.find('[data-attr="filter_reset"]');
    var export_button = analytics_header.find('[data-attr="export_button"]');
    var buttonToday = analytics_header.find('[data-attr="date_today"]');
    var buttonYesterday = analytics_header.find('[data-attr="date_yesterday"]');
    var button_parking_avg = analytics_tables.find('[data-attr="button-parking-avg"]');
    var button_parking_dates_avg = analytics_tables.find('[data-attr="button-parking-dates-avg"]');
    var button_parking_sum = analytics_tables.find('[data-attr="button-parking-sum"]');
    var button_parking_dates_sum = analytics_tables.find('[data-attr="button-parking-dates-sum"]');
    var export_table = $('#general_info_table');

    buttonToday.on('click', function() {
        if (buttonToday.hasClass('active')){
            buttonToday.removeClass('active');
            $('.input-daterange').find('input').removeAttr('disabled');
        } else {
            buttonToday.addClass('active');
            $('.input-group-addon.kv-date-remove').click();
            $('.input-daterange').find('input').attr('disabled','disabled');
        }
        buttonYesterday.removeClass('active');
    });

    buttonYesterday.on('click', function() {
        if (buttonYesterday.hasClass('active')){
            buttonYesterday.removeClass('active');
            $('.input-daterange').find('input').removeAttr('disabled');
        } else {
            buttonYesterday.addClass('active');
            $('.input-group-addon.kv-date-remove').click();
            $('.input-daterange').find('input').attr('disabled','disabled');
        }
        buttonToday.removeClass('active');
    });

    totalNumberSwitcher(button_parking_avg, button_parking_sum, table_parking);
    totalNumberSwitcher(button_parking_dates_avg, button_parking_dates_sum, table_parking_with_dates);

    $('.analytics-header .parking-list select').on('select2:close', function (evt) {
        var uldiv = $(this).siblings('span.select2').find('ul')
        var count = $(this).select2('data').length
        if(count > 0){
            uldiv.html("<li class=\"placeholder_for_selected\"> ÐžÐ±Ñ€Ð°Ð½Ð¾ " + count + "</li>")
        }
    });

    getCommonInfo();

    filter_reset.on('click', function() {
        $('[data-attr="checkbox-day"] input').attr('checked', false);
        $('.parking-list select[name*=list_of_parking]').val('').trigger('change');
        $('.input-daterange').find('input').removeAttr('disabled');
        buttonToday.removeClass('active');
        buttonYesterday.removeClass('active');
        $('.input-group-addon.kv-date-remove').click();
        // $('[name="from_date"]').val('').trigger('change')
        $('.range_inputs .cancelBtn').click();
        export_table.DataTable().destroy();
        export_table.find('tbody tr.tr_table_dates').remove();
        export_table.find('tbody tr.tr_pie').remove();
        getCommonInfo();
        button_parking_sum.click();
        button_parking_dates_sum.click();

        export_table.find('tr.pie_tr').remove();
        export_table.find('tr.pie_tr').remove();
        export_table.find('thead .totalSumWrapper_header .selected_date').text('');
        export_table.find('thead .totalSumWrapper_header .selected_parking').text('');
    });

    export_button.on('click', function() {
        $('#general_info_table_wrapper .dt-buttons span').click();
    })

    filter_button.on('click', function() {

        var parking_id = $('.parking-list select[name*=list_of_parking]').val();

        export_table.find('tr.pie_tr').remove();
        export_table.find('tr.pie_tr').remove();
        export_table.find('thead .totalSumWrapper_header .selected_date').text('');
        export_table.find('thead .totalSumWrapper_header .selected_parking').text('');

        $('[data-attr="checkbox-day"] input').attr('checked', false);
        if (widget_date_from != "") {
            var temp_data = widget_date_from.val().split(' ');
            var date_from = temp_data[0];
            var to_date = temp_data[2];
            export_table.DataTable().destroy();
            export_table.find('tbody tr.tr_table_dates').remove();
            export_table.find('tbody tr.pie_tr').remove();
            getCommonInfo(parking_id, date_from, to_date);
        } else {
            export_table.DataTable().destroy();
            export_table.find('tbody tr.tr_table_dates').remove();
            export_table.find('tbody tr.pie_tr').remove();

            getCommonInfo(parking_id);
        }
    });

    function getCommonInfo(parking_id, date_from, date_to) {
        $.ajax({
            url: "/analytics/common-information",
            type: 'GET',
            dataType:"JSON",
            data: {
                parking_id: parking_id,
                date_from: date_from,
                date_to: date_to
            },
            beforeSend: function(){
            },
            success: function (data) {
                build(data, date_from, date_to);
            }
        });
    }

    function clearInfo() {
        percentOfAmountPaymentBlock.find('div.item-legend').remove();
        table_parking.find('.block-body .table tbody tr').remove();
        table_parking_with_dates.find('.block-body .table tbody tr').remove();
        export_table.find('.avgParkWrapper_header tr.pie_tr').remove();
        export_table.find('.avgParkWrapper tr.pie_tr').remove();
        export_table.find('thead .totalSumWrapper_header .selected_date').append('');
        export_table.find('thead .totalSumWrapper_header .selected_parking').append('');
    };

    function build(data, date_from, date_to) {

        clearInfo();

        var selected_parkings = '';

        $.each($('.analytics-header .parking-list select option:selected'), function(item,value) {
            selected_parkings += item === 0 ? ' ' + $(value).text() : ', ' + $(value).text() + ' ';
        });

        export_table.find('thead .totalSumWrapper_header .selected_parking').append(selected_parkings);

        date_from = date_from == undefined || date_from === '' ? '' : date_from + ' - ';
        date_to = date_to == undefined || date_to === '' ? '' : date_to;

        // export_table.find('thead .totalSumWrapper_header .selected_date').append(date_from + date_to);
        export_table.find('thead .totalSumWrapper_header .selected_date').append($('[name="from_date"]').val());

        var totalMoneyValue = data.totalMoneyAndPayment['0'].totalMoney;
        var totalPaymentValue = data.totalMoneyAndPayment['0'].totalPayment;
        var totalOverduePaymentValue = data.totalOverduePayment['0'].overdue;
        var totalRemainedValue = data.totalRemainder['0'].totalReminder;
        var avgByOnePhoneValue = data.avgByOnePhone['0'].avgTel;
        var avgByOneParkingValue = data.avgByOneParking['0'].avgParking;
        var percentOfAmountPaymentValue = data.percentOfAmountPayment;
        var infoAboutParkingValue = data.infoAboutParking;
        var infoAboutParkingByHoursValue = data.infoAboutParkingByHours;
        var infoAboutParkingByDatesAndHours = data.infoAboutParkingByDatesAndHours;

        totalMoneyBlock.find('.value').text(totalMoneyValue + ' Ð³Ñ€Ð½');
        totalPaymentBlock.find('.value').text(totalPaymentValue);
        totalOverduePaymentBlock.find('.value').text(totalOverduePaymentValue);
        totalRemainderBlock.find('.value').text(totalRemainedValue);
        avgByOnePhoneBlock.find('.value').text(avgByOnePhoneValue);
        avgByOneParkingBlock.find('.value').text(avgByOneParkingValue);

        export_table.find('.totalSumWrapper .totalSumValue').text(totalMoneyValue + ' Ð³Ñ€Ð½');
        export_table.find('.totalCountWrapper .totalCountValue').text(totalPaymentValue);
        export_table.find('.totalOverdueWrapper .totalOverdueValue').text(totalOverduePaymentValue);
        export_table.find('.totalRemainderWrapper .totalRemainderValue').text(totalRemainedValue);
        export_table.find('.avgTelWrapper .avgTelValue').text(avgByOnePhoneValue);
        export_table.find('.avgParkWrapper .avgParkValue').text(avgByOneParkingValue);

        drawPie(percentOfAmountPaymentValue);

        $.each(percentOfAmountPaymentValue, function(item, value) {

            var background_ico = $('.highcharts-series-group g .highcharts-point.highcharts-color-' + item).css('fill');

            var item_ico = $('<span/>');

            item_ico.attr({
                'class' : 'ico',
                'style': 'background:' + background_ico + ' url(../images/ico-analytics.png) no-repeat 45% 3px; background-size: 17px'
            });

            var item_value = $('<span/>');

            item_value.text(value.rate + ' Ð³Ñ€Ð½ ' + '- ' + value.total + ' %');

            var item_legend = $('<div/>');

            item_legend.attr({
                'class': 'item-legend'
            });

            item_legend.append(item_ico);

            item_legend.append(item_value);

            var legend_td = $("<td/>");

            legend_td.text(value.rate + ' Ð³Ñ€Ð½ ' + '- ' + value.total + '% ');

            var legend_tr = $("<tr/>");

            legend_tr.attr({'class': 'pie_tr'});

            legend_tr.append(legend_td);

            for (var i = 0; i < 13; i++){
                legend_tr.append("<td></td>");
            }

            export_table.find('.avgParkWrapper_header').after(legend_tr);
            export_table.find('.avgParkWrapper').after(legend_tr);

            percentOfAmountPaymentBlock.find('.chart-legend').append(item_legend);
        });

        buildTableAboutParkingWithDates(infoAboutParkingByDatesAndHours, table_parking_with_dates);

        buildTableAboutParkingWithHours(infoAboutParkingByHoursValue, table_parking_with_dates);

        buildTableAboutParking(infoAboutParkingValue, table_parking);

        table_parking_with_dates.find('.block-body .table tbody tr.withDates').hide();
        // table switch sum or avg
        checkSumButton(button_parking_sum, table_parking);
        checkSumButton(button_parking_dates_sum, table_parking_with_dates);

        var bold_row_number = $('#general_info_table tbody tr.pie_tr:last-child()').index()  === -1 ? $('#general_info_table tbody .tr_hours_titles').index() + 3: $('#general_info_table tbody tr.pie_tr:last-child()').index()  + 6;
        var d = new Date();
        var strDate = d.getHours() + '-' + (d.getMinutes()<10?'0':'') + d.getMinutes() + ' ' + d.getDate() + "-" + (d.getMonth()+1) + "-" + d.getFullYear();

        export_table.DataTable( {
            dom: 'B',
            buttons: [
                {
                extend: 'excelHtml5',
                filename: $('.navbar-custom-menu .nav .company-menu a > span').text() + ' - ÐÐ½Ð°Ð»Ñ–Ñ‚Ð¸ÐºÐ° (Ð½Ð° ' + strDate + ')',
                customize: function(xlsx) {
                    var sheet = xlsx.xl.worksheets['sheet1.xml'];
                    $('row:nth-child(' + bold_row_number + ') c', sheet).attr( 's', '2' );
                    $('row:nth-child(' + (bold_row_number + 1) + ') c', sheet).attr( 's', '2');
                    $('row:nth-child(1) c', sheet).attr( 's', '2' );
                    var col = $('col', sheet);
                    col.each(function () {
                        $(col[0]).attr('width', 20);
                        $(this).attr('width', 20);
                        $(col[0]).nextAll().attr('width', 12);
                    });
                }
            }],
            "ordering": false,
            "bRetrieve": true
        });
    }

    daysSwitcher();

    function totalNumberSwitcher(button_avg, button_sum, table) {
        button_avg.on('click', function() {
            table.find('td.avgMoney').show();
            table.find('td.totalMoney').hide();
            $(this).addClass('active');
            button_sum.removeClass('active');
            table.find('.block-body .table thead .current_icon').find('i.fa.fa-x').show();
            table.find('.block-body .table thead .current_icon').find('i.fa.fa-summ').hide();
        });

        button_sum.on('click', function() {
            table.find('td.avgMoney').hide();
            table.find('td.totalMoney').show();
            $(this).addClass('active');
            button_avg.removeClass('active');
            table.find('.block-body .table thead .current_icon').find('i.fa.fa-x').hide();
            table.find('.block-body .table thead .current_icon').find('i.fa.fa-summ').show();
        });
    }

    function checkSumButton(button, table) {
        if (button.hasClass('active')){
            table.find('.block-body .table tbody').find('td.avgMoney').hide();
        } else {
            table.find('.block-body .table tbody').find('td.totalMoney').hide();
        }
    }

    var tr_hours_header = $('<tr/>').attr({'class': 'tr_hours_titles'});

    var tr_common_titles = $('<tr/>').attr({'class': 'tr_common_titles'});

    function buildTableAboutParking(data, table) {
        var count_export_tr = $('.analytics-tables-group [data-attr="info-about-parking-with-dates"] .block-body tbody tr').length;
        var last_tr_before_export_table = $('.tr_common_titles').index() + 2;

        var td_parking_titles = $('<td/>');

        td_parking_titles.text('Ð”ÐÐÐ† ÐŸÐž ÐŸÐÐ ÐšÐžÐ’ÐšÐÐ¥');

        // title of table
        tr_hours_header.append(td_parking_titles)

        tr_hours_header.append("<td></td>");

        // sum title
        var td_parking_sum_title = $('<td/>');
        td_parking_sum_title.attr({'data-attr': 'parking_table_sum_title'});
        td_parking_sum_title.text('');

        tr_hours_header.append(td_parking_sum_title);
        // avg title
        var td_parking_avg_title = $('<td/>');
        td_parking_avg_title.attr({'data-attr': 'parking_table_avg_title'});
        td_parking_avg_title.text('');

        tr_hours_header.append(td_parking_avg_title);


        // row with common titles

        var td_parking_time_title = $('<td/>').text('ÐŸÐ°Ñ€ÐºÐ¾Ð²ÐºÐ°');

        tr_common_titles.append(td_parking_time_title);

        var tr_pay_count_title = $('<td/>').text('ÐšÑ–Ð»ÑŒÐºÑ–ÑÑ‚ÑŒ Ð¾Ð¿Ð»Ð°Ñ‚');

        tr_common_titles.append(tr_pay_count_title);

        tr_common_titles.append('<td>Ð¡ÑƒÐ¼Ð°</td>');

        tr_common_titles.append('<td>Ð¡ÐµÑ€ÐµÐ´Ð½Ñ” Ð·Ð½Ð°Ñ‡ÐµÐ½Ð½Ñ</td>');

        $.each(data, function(item, value) {
            var tr = $("<tr/>");

            if ('dates' in value) {
                tr.attr({'class': 'withHours'})
            } else if ('hours' in value) {
                tr.attr({'class': 'withHours'})
            }

            var td_name = $("<td/>");
            td_name.text(value.name ? value.name : value.hours + ':00');
            tr.append(td_name);

            var td_transaction = $("<td/>");
            td_transaction.text(value.countTransaction);
            tr.append(td_transaction);

            var td_total_money = $("<td/>");
            td_total_money.attr({'class': 'totalMoney'});
            td_total_money.text(value.totalMoney);
            tr.append(td_total_money);

            var td_avg_money = $("<td/>");
            td_avg_money.attr({'class': 'avgMoney'});
            td_avg_money.text(value.avgMoney);
            tr.append(td_avg_money);

            table.find('.block-body .table tbody').append(tr);

            export_table.find($('tbody tr:nth-child('+ last_tr_before_export_table + ')')).append('<td></td>');

            var export_td_name = $('<td/>').text(value.name ? value.name : value.hours + ':00');
            export_table.find($('tbody tr:nth-child('+ last_tr_before_export_table + ')')).append(export_td_name);
            var export_td_transaction = $('<td/>').text(value.countTransaction);
            export_table.find($('tbody tr:nth-child('+ last_tr_before_export_table + ')')).append(export_td_transaction);
            var export_td_total_money = $('<td/>').text(value.totalMoney);
            export_table.find($('tbody tr:nth-child('+ last_tr_before_export_table + ')')).append(export_td_total_money);
            var export_td_avg_money = $('<td/>').text(value.avgMoney);
            export_table.find($('tbody tr:nth-child('+ last_tr_before_export_table + ')')).append(export_td_avg_money);

            last_tr_before_export_table++;
        });

        for(var a = data.length; a < count_export_tr; a++) {
            for (var k = 0; k < 5; k++) {
                export_table.find($('tbody tr:nth-child('+ last_tr_before_export_table + ')')).append("<td></td>");
            }
            last_tr_before_export_table++;
        }

    }

    function buildTableAboutParkingWithHours(data, table) {

        var count_export_tr = $('.analytics-tables-group [data-attr="info-about-parking-with-dates"] .block-body tbody tr').length;

        var td_hours_titles = $('<td/>');

        td_hours_titles.attr({'class' : 'hours_main_titles'});

        td_hours_titles.text('Ð”ÐÐÐ† ÐŸÐžÐ“ÐžÐ”Ð˜ÐÐÐž');

        // title of table
        tr_hours_header.append(td_hours_titles)

        tr_hours_header.append("<td></td>");

        // sum title
        var td_hours_sum_title = $('<td/>');
        td_hours_sum_title.attr({'data-attr': 'hours_table_sum_title'});
        td_hours_sum_title.text('');

        tr_hours_header.append(td_hours_sum_title);
        // avg title
        var td_hours_avg_title = $('<td/>');
        td_hours_avg_title.attr({'data-attr': 'hours_table_avg_title'});
        td_hours_avg_title.text('');

        tr_hours_header.append(td_hours_avg_title);

        tr_hours_header.append('<td data-attr="first_table_last_td"></td>');

        export_table.find('tbody tr.pie_tr:last-child').after(tr_hours_header);

        // row with common titles
        var td_pay_time_title = $('<td/>').text('Ð§Ð°Ñ Ð¾Ð¿Ð»Ð°Ñ‚Ð¸');

        tr_common_titles.append(td_pay_time_title);

        var tr_pay_count_title = $('<td/>').text('ÐšÑ–Ð»ÑŒÐºÑ–ÑÑ‚ÑŒ Ð¾Ð¿Ð»Ð°Ñ‚');

        tr_common_titles.append(tr_pay_count_title);

        tr_common_titles.append('<td>Ð¡ÑƒÐ¼Ð°</td>');

        tr_common_titles.append('<td>Ð¡ÐµÑ€ÐµÐ´Ð½Ñ” Ð·Ð½Ð°Ñ‡ÐµÐ½Ð½Ñ</td>');

        tr_common_titles.append('<td data-attr="first_table_last_title"></td>');

        export_table.find($(tr_hours_header)).after(tr_common_titles);

        var last_tr_before_export_table = $('.tr_common_titles').index() + 2;

        $.each(data, function(item, value) {
            var tr = $("<tr/>");

            if ('dates' in value) {
                tr.attr({'class': 'withHours'})
            } else if ('hours' in value) {
                tr.attr({'class': 'withHours'})
            }

            var td_name = $("<td/>");
            td_name.text(value.name ? value.name : value.hours + ':00');
            tr.append(td_name);

            var td_transaction = $("<td/>");
            td_transaction.text(value.countTransaction);
            tr.append(td_transaction);

            var td_total_money = $("<td/>");
            td_total_money.attr({'class': 'totalMoney'});
            td_total_money.text(value.totalMoney);
            tr.append(td_total_money);

            var td_avg_money = $("<td/>");
            td_avg_money.attr({'class': 'avgMoney'});
            td_avg_money.text(value.avgMoney);
            tr.append(td_avg_money);

            table.find('.block-body .table tbody').append(tr);

            var export_td_name = $('<td/>').text(value.name ? value.name : value.hours + ':00');
            export_table.find($('tbody tr:nth-child('+ last_tr_before_export_table + ')')).append(export_td_name);
            var export_td_transaction = $('<td/>').text(value.countTransaction);
            export_table.find($('tbody tr:nth-child('+ last_tr_before_export_table + ')')).append(export_td_transaction);
            var export_td_total_money = $('<td/>').text(value.totalMoney);
            export_table.find($('tbody tr:nth-child('+ last_tr_before_export_table + ')')).append(export_td_total_money);
            var export_td_avg_money = $('<td/>').text(value.avgMoney);
            export_table.find($('tbody tr:nth-child('+ last_tr_before_export_table + ')')).append(export_td_avg_money);
            last_tr_before_export_table++;
        });

        for(var a = data.length; a < count_export_tr; a++) {
            for (var b = 0; b < 4; b++) {
                export_table.find($('tbody tr:nth-child('+ last_tr_before_export_table + ')')).append("<td></td>");
            }
            last_tr_before_export_table++;
        }
    }

    function buildTableAboutParkingWithDates(data, table) {

        var legend_tr = $("<tr/>");

        legend_tr.attr({'class': 'pie_tr'});

        var legend_td = $("<td/>");

        legend_tr.append(legend_td);

        for (var i = 0; i < 13; i++){
            legend_tr.append("<td></td>");
        }

        export_table.find('tbody tr:last-child').after(legend_tr);

        var current_date;

        $.each(data, function(item, value) {
            var tr = $("<tr/>");

            if ('dates' in value) {
                tr.attr({'class': 'withDates'})
            }

            if(current_date != value.dates) {
                current_date = value.dates;
                var tr_date = $("<tr/>");
                tr_date.attr({
                    'class': 'withDates date_header'
                })

                tr_date.append('<td></td>');
                tr_date.append('<td>'+ value.dates +'</td>');
                tr_date.append('<td></td>');
            }
            var td_name = $("<td/>");
            td_name.text(value.name ? value.name : value.hours + ':00');
            tr.append(td_name);

            var td_transaction = $("<td/>");
            td_transaction.text(value.countTransaction);
            tr.append(td_transaction);

            var td_total_money = $("<td/>");
            td_total_money.attr({'class': 'totalMoney'});
            td_total_money.text(value.totalMoney);
            tr.append(td_total_money);

            var td_avg_money = $("<td/>");
            td_avg_money.attr({'class': 'avgMoney'});
            td_avg_money.text(value.avgMoney);
            tr.append(td_avg_money);

            table.find('.block-body .table tbody').append(tr_date);
            table.find('.block-body .table tbody').append(tr);
        });

        var count_export_tr = $('.analytics-tables-group [data-attr="info-about-parking-with-dates"] .block-body tbody tr').length;
        // Ð”Ð°Ð½Ñ– Ð¿Ð¾ Ð³Ð¾Ð´Ð¸Ð½Ð°Ð¼
        var td_hours_titles = $('<td/>');

        td_hours_titles.attr({'class' : 'hours_main_titles'});

        td_hours_titles.text('Ð”ÐÐÐ† ÐŸÐž Ð”ÐÐ¢ÐÐœ');

        // title of table
        tr_hours_header.append(td_hours_titles)

        tr_hours_header.append("<td></td>");

        // sum title
        var td_hours_sum_title = $('<td/>');
        td_hours_sum_title.attr({'data-attr': 'hours_table_sum_title'});
        td_hours_sum_title.text('');

        tr_hours_header.append(td_hours_sum_title);
        // avg title
        var td_hours_avg_title = $('<td/>');
        td_hours_avg_title.attr({'data-attr': 'hours_table_avg_title'});
        td_hours_avg_title.text('');

        tr_hours_header.append(td_hours_avg_title);

        tr_hours_header.append('<td data-attr="first_table_last_td"></td>');

        export_table.find('tbody tr.pie_tr:last-child').after(tr_hours_header);

        // row with common titles
        var td_pay_time_title = $('<td/>').text('Ð§Ð°Ñ Ð¾Ð¿Ð»Ð°Ñ‚Ð¸');

        tr_common_titles.append(td_pay_time_title);

        var tr_pay_count_title = $('<td/>').text('ÐšÑ–Ð»ÑŒÐºÑ–ÑÑ‚ÑŒ Ð¾Ð¿Ð»Ð°Ñ‚');

        tr_common_titles.append(tr_pay_count_title);

        tr_common_titles.append('<td>Ð¡ÑƒÐ¼Ð°</td>');

        tr_common_titles.append('<td>Ð¡ÐµÑ€ÐµÐ´Ð½Ñ” Ð·Ð½Ð°Ñ‡ÐµÐ½Ð½Ñ</td>');

        tr_common_titles.append('<td data-attr="first_table_last_title"></td>');

        export_table.find($(tr_hours_header)).after(tr_common_titles);

        for (var i = 0; i < count_export_tr; i++) {
            var tr_export_dates = $('<tr/>').attr({
                'class' : 'tr_table_dates'
            });
            export_table.find($('tbody tr:last-child')).after(tr_export_dates);
        }
        var last_tr_before_export_table = $('.tr_common_titles').index() + 2;

        $.each(data, function(item, value) {

            if(current_date != value.dates) {
                current_date = value.dates;
                export_table.find($('tbody tr:nth-child('+ last_tr_before_export_table + ')')).append("<td></td>");
                export_table.find($('tbody tr:nth-child('+ last_tr_before_export_table + ')')).append("<td>" + current_date + "</td>");
                export_table.find($('tbody tr:nth-child('+ last_tr_before_export_table + ')')).append("<td></td>");
                export_table.find($('tbody tr:nth-child('+ last_tr_before_export_table + ')')).append("<td></td>");
                export_table.find($('tbody tr:nth-child('+ last_tr_before_export_table + ')')).append("<td></td>");
                last_tr_before_export_table++;
            }
            var export_td_name = $('<td/>').text(value.name ? value.name : value.hours + ':00');
            export_table.find($('tbody tr:nth-child('+ last_tr_before_export_table + ')')).append(export_td_name);
            var export_td_transaction = $('<td/>').text(value.countTransaction);
            export_table.find($('tbody tr:nth-child('+ last_tr_before_export_table + ')')).append(export_td_transaction);
            var export_td_total_money = $('<td/>').text(value.totalMoney);
            export_table.find($('tbody tr:nth-child('+ last_tr_before_export_table + ')')).append(export_td_total_money);
            var export_td_avg_money = $('<td/>').text(value.avgMoney);
            export_table.find($('tbody tr:nth-child('+ last_tr_before_export_table + ')')).append(export_td_avg_money);
            export_table.find($('tbody tr:nth-child('+ last_tr_before_export_table + ')')).append("<td></td>");

            last_tr_before_export_table++;
        });

        for(var a = data.length; a < count_export_tr; a++) {
            for (var k = 0; k <= 4; k++){
                export_table.find($('tbody tr:nth-child('+ last_tr_before_export_table + ')')).append("<td></td>");
            }
            last_tr_before_export_table++;
        }
    }

    function daysSwitcher() {

        $('[data-attr="checkbox-day"] input').change(function() {
            if  ($(this).is(":checked")) {
                table_parking_with_dates.find('.block-body .table tbody tr.withHours').hide();
                table_parking_with_dates.find('.block-body .table tbody tr.withDates').fadeIn(300);
            } else {
                table_parking_with_dates.find('.block-body .table tbody tr.withHours').fadeIn(300);
                table_parking_with_dates.find('.block-body .table tbody tr.withDates').hide();
            }
        });
        table_parking_with_dates.find('.block-body .table tbody tr');
    }
    function drawPie(data) {
        var series = [];
        $.each(data, function(item, value) {
            if (item === 1) {
                series.push({'name': value.rate + ' Ð³Ñ€Ð½', 'y': value.total, 'color': '#8085A9'})
            } else {
                series.push({'name': value.rate + ' Ð³Ñ€Ð½', 'y': value.total})
            }
        })
        Highcharts.chart('container', {
            chart: {
                backgroundColor: null,
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            credits: {
                enabled: false
            },
            exporting: { enabled: false },
            title: {
                text:''
            },
            tooltip: {
                pointFormat: '{point.y:f}%'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: false,
                    cursor: 'pointer',
                    dataLabels: {
                        // distance: -30,
                        // color: 'white'
                        enabled: false
                    },
                    showInLegend: false,
                    size: 100,
                    states: {
                        hover: {
                            enabled: false
                        }
                    }
                },
            },
            series: [{
                name: '',
                data: series
            }]
        });
    }
});