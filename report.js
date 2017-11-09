$(document).ready(function() {
    var statisticIndex = $('.statistic-index');
    var statisticLeftBlock = $('[data-attr="statistic-left"]');
    var statisticCenterBlock = $('[data-attr="statistic-center"]');
    var statisticItemHeaderBlock = $('[data-attr="statistic-item-header"]');
    var statisticSummaryBlock = $('[data-attr="statistic-summary"]');
    var statisticFilterBlock = $('.statistic-filter');
    var filterButton = $('[data-attr="filter-button"]');
    var clearFilterButton = $('[data-attr="clear-filter-button"]');
    var toolsFilterButton = $('.box-tools .btn.btn-filter');
    var statisticTable = $('#statistic_table');

    statisticFilterBlock.hide();

    $('.btn-filter').on('click', function () {
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
        } else {
            $(this).addClass('active');
        }
    });

    $('.btn-export').on('click', function () {
        $('#statistic_table_wrapper > div > a > span').click();
    });

    toolsFilterButton.on('click', function () {
        if ((statisticFilterBlock).is(":visible")) {
            statisticFilterBlock.hide();
            statisticIndex.removeClass('show-filter');

        } else {
            statisticFilterBlock.show(300);
            statisticIndex.addClass('show-filter');
        }
    });

    // get common data (groups, cells, headers)
    getResults();

    // add groups list

    function addGroupListTable(groups, groups_list, modules_list, regions_list, course_round) {

        var listOfUsers = '';
        var listOfUsersResult = '';
        var listOfAllUsers = '';

        function fullResults(group_id, modules_list, regions_list, course_round) {
            $.ajax({
                url: "/statistics/users-results",
                async: false,
                type: 'GET',
                dataType:"JSON",
                data: {
                    group_id : group_id,
                    modules_list : modules_list,
                    regions_list: regions_list,
                    course_round: course_round
                },
                success: function (data) {
                    listOfUsersResult = data.result;
                    listOfUsers = data.users;
                    listOfAllUsers = data.allUsers;
                }
            });
        }

        fullResults(groups_list, modules_list, regions_list, course_round);

        $.each(groups, function(i, val) {

            group_tr = $('<tr/>');

            group_tr.attr({
                'data-attr': 'group_tr',
                'data-group': 'with_title'
            });

            group_td = $('<td/>');

            group_tr.attr({
                'data-group_id': val.group_id
            });

            group_td.text(val.group_name);

            group_tr.append(group_td);

            statisticTable.append(group_tr);

            $.each(listOfUsersResult, function (item, value) {
                var user_row = $('tbody tr[data-attr="group_tr"][data-type="group_user"][data-user_group_id="' + value.group_id + '"]');
                if ($('tbody tr[data-user_id="' + value.user_id + '"][data-user_group_id="'+value.group_id+'"]').length == 0) {
                    if (user_row.length > 0) {
                        user_row.after('<tr data-attr="group_tr" data-type="group_user" data-user_id="' + value.user_id + '" data-user_group_id="'+ value.group_id +'"><td>' + value.name + '</td></tr>');
                    } else {
                         // $('tbody [data-attr="group_tr"][data-group_id='+ value.group_id +']').after('<tr data-attr="group_tr" data-type="group_user" data-user_id="' + value.user_id + '" data-user_group_id="'+ value.group_id +'"><td>' + value.name + '</td></tr>');
                    }
                }
            });
            console.log(listOfAllUsers);
            $.each(listOfAllUsers, function (item, value) {
                // console.log(value.group_id);
                if ($('tbody tr[data-user_id="' + value.id + '"]').length === 0) {
                    $('tbody [data-attr="group_tr"][data-group_id="'+value.group_id+'"]').after('<tr data-attr="group_tr" data-user_id="' + value.id + '" data-user_group_id="'+value.group_id+'"><td>' + value.name + '</td></tr>');
                    if (value.group_id === null) {
                        $('tbody [data-attr="group_tr"][data-group_id="0"]').after('<tr data-attr="group_tr" data-user_id="' + value.id + '" data-user_group_id="0"><td>' + value.name + '</td></tr>');
                    }
                }
            });

        });
    }

    function addSummaryScoreTable(headers, groups) {

        $.each(groups, function(i, val) {
            val.group_score = val.group_score == '-' ? '' : val.group_score;
            $('tbody tr[data-attr="group_tr"][data-group_id="' + val.group_id + '"] td:last-child').after('<td data-attr="group_score">' + val.group_score + '</td>');

        });
    }

    function addCenterHeaderTable(headers, totalActivitiesScore) {

        group_header_modules_tr = $('<tr/>');

        group_header_modules_tr.attr({
            'data-attr' : 'header_modules_group'
        });

        group_header_modules_tr.append('<th>ÐœÐ¾Ð´ÑƒÐ»Ñ–</th>');

        group_header_users_tr = $('<tr/>');

        group_header_users_tr.attr({
            'data-attr' : 'header_users_group'
        });

        group_header_users_tr.append('<th>ÐšÐ¾Ñ€Ð¸ÑÑ‚ÑƒÐ²Ð°Ñ‡Ñ–</th>');

        statisticTable.find('thead').append(group_header_modules_tr);

        group_header_users_tr.insertBefore('#statistic_table tbody > tr:first');

        $.each(headers, function(i, val) {

            header_module_list_th = $('<td/>');

            header_module_list_th.attr({
                'attr-module_id': val.module_id
            });

            if (($('td[attr-module_id="' + val.module_id + '"]')).length > 0) {
                header_module_list_th.text('');
            } else {
                header_module_list_th.text(val.module_name);
            }

            header_users_list_th = $('<td/>');

            header_users_list_th.attr({
                'attr-course_id': val.course_id
            });

            if (($('td[attr-course_id="' + val.course_id + '"]')).length > 0) {
                header_users_list_th.text('');
            } else {
                header_users_list_th.text(val.course_name);
            }

            statisticTable.find('thead tr[data-attr="header_modules_group"]').append(header_module_list_th);

            statisticTable.find('tbody tr[data-attr="header_users_group"]').append(header_users_list_th);
        });
        statisticTable.find('thead tr[data-attr="header_modules_group"] td:last-child').after('<td>Ð¡ÑƒÐ¼Ð° Ð±Ð°Ð»Ñ–Ð²</td>');

        var current_round = '';
        var filter_container_round = $('[data-attr="filter-container-round"]');
        var value_from_filter = filter_container_round.find("select[name='round_list_select']").select2('data')[0]['id'];
        if (value_from_filter != '') {
            current_round = filter_container_round.find("select[name='round_list_select']").select2('data')[0]['text'];
        }

        statisticTable.find('tbody tr[data-attr="header_users_group"] td:last-child').after('<td>' + current_round + '</td>');
    }

    function addStatisticCenterTable(headers, groups, cells, groups_list, modules_list, regions_list, course_round) {

        var listOfUsersResult = '';
        var listOfUsers = '';
        var listOfAllUsers = '';

        function fullResults(group_id, modules_list, regions_list, course_round) {
            $.ajax({
                url: "/statistics/users-results",
                async: false,
                type: 'GET',
                dataType:"JSON",
                data: {
                    group_id : group_id,
                    modules_list : modules_list,
                    regions_list: regions_list,
                    course_round: course_round
                },
                success: function (data) {
                    listOfUsersResult = data.result;
                    listOfUsers = data.users;
                    listOfAllUsers = data.allUsers;
                }
            });
        }

        fullResults(groups_list, modules_list, regions_list, course_round);

        $.each(groups, function(i, val) {

            $.each(headers, function(item, value) {
                $('tbody tr[data-group_id="' + val.group_id + '"]').append('<td data-activity_id="'+value.activity_id+'"></td>');
                $('tbody tr[data-user_group_id="' + val.group_id + '"]').append('<td data-activity_id="'+value.activity_id+'" data-group="' + val.group_id + '"></td>');
            });
        });

        $.each(cells, function(item, value) {
            if(value.group_id === null) {
                value.group_id = 0;
            }
            $('tbody tr[data-group_id="' + value.group_id + '"]  [data-activity_id=' + value.activity_id + ']').text(value.got_result);
        });

        $.each(listOfUsersResult, function (item, value) {

            if(value.group_id === null) {
                value.group_id = 0;
            }

            $('tbody [data-attr="group_tr"][data-user_id="' + value.user_id + '"][data-user_group_id="'+ value.group_id +'"]').find('td[data-activity_id="' + value.activity_id + '"]').text(value.got_score);

            $('tbody [data-attr="group_tr"][data-user_id="' + value.user_id + '"][data-user_group_id="'+ value.group_id +'"]').find('td[data-attr="max_score"]').text(parseInt(($('tbody [data-attr="group_tr"][data-user_id="' + value.user_id + '"][data-user_group_id="'+ value.group_id +'"]').find('td[data-attr="max_score"]')).html()) + parseInt(value.got_score));

            if ($('[data-attr="group_tr"][data-user_id="' + value.user_id + '"] td[data-attr="max_score"]').length === 0) {
                value.got_score = value.got_score == 0 ? '0' : value.got_score;
                $('tbody [data-attr="group_tr"][data-user_id="' + value.user_id + '"][data-user_group_id="'+ value.group_id +'"]').find('td:last-child').after('<td data-attr="max_score">' + value.got_score + '</td>');
            }
        });
        // removed 0 values
        $.each($('#statistic_table tbody tr td[data-attr="max_score"]'), function () {
           if ($(this).text() == 0) {
               $(this).text('');
           }
        });

        $.each(listOfAllUsers, function (item, value) {

            $('tbody [data-attr="group_tr"][data-user_id="' + value.id + '"][data-user_group_id="' + value.group_id + '"]').find('td[data-activity_id="' + value.activity_id + '"]').text(value.max_score);

            $('tbody [data-attr="group_tr"][data-user_id="' + value.id + '"][data-user_group_id="0"]').find('td[data-activity_id="' + value.activity_id + '"]').text(value.max_score);

            if ($('[data-attr="group_tr"][data-user_id="' + value.id + '"] td[data-attr="max_score"]').length === 0) {
                value.max_score = value.max_score == 0 ? '' : value.max_score;
                $('tbody [data-attr="group_tr"][data-user_id="' + value.id + '"][data-user_group_id="' + value.group_id  + '"]').find('td:last-child').after('<td data-attr="max_score">' + value.max_score + '</td>');
                $('tbody [data-attr="group_tr"][data-user_id="' + value.id + '"][data-user_group_id="0"]').find('td:last-child').after('<td data-attr="max_score">' + value.max_score + '</td>');
            }
        });
    }

    function addGroupList(groups) {

        $.each(groups, function(i, val) {

            var groupBlock = $('<div/>');

            groupBlock.attr({
                'data-attr': 'group-block',
                'class': 'statistic-item item-group',
                'attr-groupId': val.group_id
            });

            var groupTitle = $('<div/>');

            groupTitle.attr({
                'data-attr': 'group-title',
                'class': 'title-group'
            });

            groupTitle.hover(function () {
                $(this).css('cursor', 'pointer');
            });

            if(val.group_name === null) {
                val.group_name = 'Ð‘ÐµÐ· Ð³Ñ€ÑƒÐ¿Ð¸';
            }

            var groupTitleSpan = $('<span/>');

            groupTitleSpan.text(val.group_name);

            groupTitle.append(groupTitleSpan);

            groupBlock.append(groupTitle);

            statisticLeftBlock.append(groupBlock);

        });
    }

    function addSummaryScore(headers, groups, totalActivitiesScore) {

        var totalResult = $('<span/>');

        totalResult.attr({
            'data-attr': 'maxScoreOfActivities'
        });

        totalResult.text(totalActivitiesScore.total_score);

        $('.statistic .statistic-header .statistic-summary .statistic-item.item-header').append(totalResult);

        $.each(groups, function(i, val) {

            var summaryBlock =  $('<div/>');

            summaryBlock.attr({
                'data-attr': 'summary-block',
                'class': 'statistic-item item-group',
                'attr-item-group_id': val.group_id
            });

            var totalResult = $('<div/>');

            if (val.group_score == 0) {
                totalResult.attr({
                    'class': 'total-result-group list-group__tests for-transparency',
                    'attr-group_id': val.group_id,
                    'data-attr': 'total-sum-score'
                });
            } else {
                totalResult.attr({
                    'class': 'total-result-group list-group__tests',
                    'attr-group_id': val.group_id,
                    'data-attr': 'total-sum-score'
                });
            }

            val.group_score = val.group_score == 0 ? '-' : val.group_score;

            totalResult.text(val.group_score);

            summaryBlock.append(totalResult);

            statisticSummaryBlock.append(summaryBlock);

        });

        var totalSumScoreBlock = $('[data-attr="total-sum-score"]');
    }

    function addCenterHeader(headers) {

        $.each(headers, function(i, val) {

            var statisticItemModule = $('<div/>');

            statisticItemModule.attr({
                'class': 'statistic-item__module',
                'module': val.module_id
            });

            //course name
            var titleModule = $('<div/>');

            titleModule.attr({
                'class': 'title-modules',
                'title': val.module_name
            });

            titleModule.text(val.module_name);

            // list with lessons
            var listGroup = $('<div/>');

            listGroup.attr({
                'class': 'list-group list-group__tests'
            });

            // number of lesson and empty block for test
            var listTest = $('<div/>');

            listTest.attr({
                'class': 'list-group-item__test for-transparency',
                'course': val.course_id,
                'activity': val.activity_id
            });

            var numLesson = $('<span/>');

            numLesson.attr({
                'class': 'num-lesson',
                'title': val.course_name
            });

            var ModuleOnPage = $('[module="' + val.module_id + '"]');
            var CourseOnPage = $('.statistic-item.item-header').find('[course="' + val.course_id + '"]');

            // If current module is on page, then add data in this module
            if (ModuleOnPage.length > 0) {
                listGroup = ModuleOnPage.find('.list-group.list-group__tests');
                statisticItemModule = ModuleOnPage.append(listGroup);
            } else {
                statisticItemModule.append(titleModule);
                statisticItemModule.append(listGroup);
            }

            if (CourseOnPage.length === 0) {
                numLesson.text();
                listTest.append(numLesson);
            }

            listGroup.append(listTest);

            statisticItemHeaderBlock.append(statisticItemModule);
        });

        // Add course numbers to header
        $.each($('.item-header .statistic-item__module'), function(e) {
            $.each($(this).find('.num-lesson'), function(index) {
                $(this).text(index + 1);
            })
        });
    }

    function addStatisticCenter(headers, groups, cells) {

        $.each(groups, function(i, val) {

            var statisticItemGroup = $('<div/>');

            statisticItemGroup.attr({
                'class' : 'statistic-item item-group',
                'data-attr': 'center-statistic-item',
                'group_id': val.group_id
            });

            var statisticItemModule = $('<div/>');

            statisticItemModule.attr({
                'class': 'statistic-item__module',
                'module': val.module_id
            });

            // list with lessons
            var listGroup = $('<div/>');

            listGroup.attr({
                'class': 'total-result-group list-group__tests'
            });

            statisticCenterBlock.find('.statistic-scroll').append(statisticItemGroup);

            $.each(headers, function(item, value) {

                // number of lesson and empty block for test
                var listTest = $('<div/>');

                listTest.attr({
                    'class': 'list-group-item__test for-transparency',
                    'course': value.course_id,
                    'activity': value.activity_id,
                    'title': value.activity_name
                });

                listTest.text('-');

                listGroup.append(listTest);

                statisticItemModule.append(listGroup);

                listGroup.append(listTest);

                statisticItemGroup.append(statisticItemModule);

            });
        });

        $.each(cells, function(item, value) {
            if (value.group_id === null) {
                value.group_id = 0;
            }
            statisticCenterBlock.find('[group_id='+value.group_id+'] [activity=' + value.activity_id + ']').removeClass('for-transparency');
            statisticCenterBlock.find('[group_id='+value.group_id+'] [activity=' + value.activity_id + ']').text(value.got_result);
        });
    }

    function getResults(groups_list, modules_list, regions_list, course_round) {
        $.ajax({
            url: "/statistics/results",
            type: 'GET',
            dataType:"JSON",
            data: {
                groups_list : groups_list,
                modules_list : modules_list,
                regions_list : regions_list,
                course_round: course_round
            },
            beforeSend: function(){
                $('.loading').css('display', 'flex');
                $('.statistic').hide();
                $('[data-attr="filter-button"]').attr('disabled', true);
                $('[data-attr="clear-filter-button"]').attr('disabled', true);
            },
            success: function (data) {
                build(data, groups_list, modules_list, regions_list, course_round);
                $('.loading').css('display', 'none');
                $('.statistic').fadeIn('slow');
                $('[data-attr="filter-button"]').attr('disabled', false);
                $('[data-attr="clear-filter-button"]').attr('disabled', false);
            }
        });
    }

    function build(data, groups_list, modules_list, regions_list, course_round) {

        var groups = data.groups;
        var cells = data.cells;
        var headers = data.headers;
        var totalActivitiesScore = data.totalActivitiesScore;

        addGroupList(groups);
        addCenterHeader(headers);
        addStatisticCenter(headers, groups, cells);
        addSummaryScore(headers, groups, totalActivitiesScore[0]);

        addGroupListTable(groups, groups_list, modules_list, regions_list, course_round);
        addCenterHeaderTable(headers, totalActivitiesScore[0]);
        addStatisticCenterTable(headers, groups, cells, groups_list, modules_list, regions_list, course_round);
        addSummaryScoreTable(headers, groups);

        statisticLeftBlock.find($('[data-attr="group-title"]')).on('click', function () {

            var currentGroupBlock = $(this).closest('[data-attr="group-block"]');

            var group_id = currentGroupBlock.attr('attr-groupid');
            //users result block
            var itemModuleBlock = $('[group_id="' + group_id + '"]');

            if (currentGroupBlock.hasClass('open')) {
                currentGroupBlock.removeClass('open');
                currentGroupBlock.find('.title-group').removeClass('is-open');
                currentGroupBlock.find('.list-group_users').remove();
                itemModuleBlock.removeClass('open');
                itemModuleBlock.find('.list-group.list-group_users').remove();
                statisticSummaryBlock.find('[attr-item-group_id='+ group_id +']').removeClass('open');
                statisticSummaryBlock.find('[attr-item-group_id='+ group_id +'] .list-group.list-group_users').remove();
            } else {
                currentGroupBlock.addClass('open');
                currentGroupBlock.find('.title-group').addClass('is-open');
                statisticSummaryBlock.find('[attr-item-group_id='+ group_id +']').addClass('open');
                itemModuleBlock.addClass('open');
                if (currentGroupBlock.find('.list-statistic.list-group_users').length > 0){
                    return false;
                } else {
                    getUsersResult(group_id, modules_list, regions_list, course_round);
                }
            }
        });

        function getUsersResult(group_id, modules_list, regions_list, course_round) {
            $.ajax({
                url: "/statistics/users-results",
                type: 'GET',
                dataType:"JSON",
                data: {
                    group_id : group_id,
                    modules_list : modules_list,
                    regions_list: regions_list,
                    course_round: course_round
                },
                success: function (data) {
                    buildUsers(data, group_id, headers, course_round)
                }
            });
        }

        function buildUsers(data, group_id, headers, course_round) {

            var groupTitle = $('[attr-groupid="' + group_id + '"]').find('.title-group');

            var listGroupUsers = $("<div/>");

            listGroupUsers.attr({
                'class': 'list-statistic list-group_users'
            });

            groupTitle.after(listGroupUsers);

            var statistic_item_module = $('[group_id="' + group_id + '"]').find('.statistic-item__module');

            var statistic_item_user = $('<div/>');

            // statistic list block after module
            statistic_item_user.attr({
                'class': 'statistic-item statistic-item__user list-group__tests'
            });

            var user_list_tests = $('<div/>');

            user_list_tests.attr({
                'class': 'list-group list-group_users'
            });

            var summary_list_group_user = $('<div/>');

            summary_list_group_user.attr({
                'class': 'list-group list-group_users'
            });

            $.each(data.users, function (item, value) {

                var user_name_in_list = $('<span/>');

                user_name_in_list.attr({
                    'class' : 'user_name_in_list'
                });

                user_name_in_list.text(value.name);

                var item_user = $('<div/>');

                item_user.attr({
                    'class': 'statistic-item statistic-item__user'
                });

                item_user.append(user_name_in_list);

                listGroupUsers.append(item_user);

                var item_user_list_test = $('<div/>');

                item_user_list_test.attr({
                    'class': 'statistic-item statistic-item__user list-group__tests',
                    'attr-user_id': value.id
                });

                user_list_tests.append(item_user_list_test);

                // add 0 results for every user in every module
                $.each(headers, function(item, value) {
                    // number of lesson and empty block for test
                    var list_user_test = $('<div/>');

                    list_user_test.attr({
                        'class': 'list-group-item__test for-transparency',
                        'attr-activity': value.activity_id,
                        'title': value.activity_name
                    });

                    list_user_test.text('-');

                    item_user_list_test.append(list_user_test);
                });

                var summary_statistic_item_user = $('<div/>');

                if (value.max_score == 0) {
                    summary_statistic_item_user.attr({
                        'class': 'statistic-item statistic-item__user for-transparency',
                        'attr-summary-score-user_id': value.id
                    });
                } else {
                    summary_statistic_item_user.attr({
                        'class': 'statistic-item statistic-item__user',
                        'attr-summary-score-user_id': value.id
                    });
                }

                value.max_score = value.max_score == 0 ? '-' : value.max_score;

                summary_statistic_item_user.text(value.max_score);

                summary_list_group_user.append(summary_statistic_item_user);

                statisticSummaryBlock.find('[attr-group_id='+ group_id +']').after(summary_list_group_user);

            });

            statistic_item_module.find('.list-group__tests').after(user_list_tests);

            $.each(data.result, function(item, value) {
                statisticCenterBlock.find('[attr-user_id='+ value.user_id +'] [attr-activity=' + value.activity_id + ']').removeClass('for-transparency');
                statisticCenterBlock.find('[attr-user_id='+ value.user_id +'] [attr-activity=' + value.activity_id + ']').text(value.got_score);
            });
        }

        $('#statistic_table').DataTable( {
            dom: 'B',
            "iDisplayLength": "100",
            buttons: [{
                extend: 'excelHtml5',
                customize: function(xlsx) {
                    var sheet = xlsx.xl.worksheets['sheet1.xml'];
                    $.each($('tbody [data-attr="group_tr"][data-group="with_title"]'), function () {
                        $('c[r=A'+ ($(this).index() + 2) +']', sheet).attr('s', 2);
                    });

                     $('c[r=A'+ ($('#statistic_table tbody tr').length + 2) +']', sheet).attr('s', 2);

                    var col = $('col', sheet);
                    col.each(function () {
                        $(col[0]).attr('width', 40);
                        $(this).attr('width', 10);
                    });
                }
            }],
            "ordering": false,
            "bRetrieve": true
        });
    }

    clearFilterButton.on('click', function () {
        toolsFilterButton.click();
        $('[data-attr="wrapper-for-filter"]').find("input[type='checkbox']:checked").each(function(){
            $(this).prop('checked', false);
        });
        $('[data-attr="filter-container-round"]').find("select[name='round_list_select']")
            .val($('[data-attr="filter-container-round"]').attr('data-attr-value'))
            .trigger("change");
        $('.statistic-header .statistic-center .item-header .statistic-item__module').remove();
        $('.statistic-body .statistic-left .statistic-item').remove();
        $('.statistic-body .statistic-center .statistic-item.item-group').remove();
        $('.statistic-summary [data-attr="summary-block"]').remove();
        $('#statistic_table').DataTable().destroy();
        $('#statistic_table thead tr').remove();
        $('#statistic_table tbody tr').remove();
        $('[data-attr="maxScoreOfActivities"]').remove();

        getResults();
        removeDraggableStyles($('.statistic-header .statistic-center .statistic-scroll'));
        removeDraggableStyles($('.statistic-body .statistic-center .statistic-scroll'));
        draggableTable();
    });

    filterButton.on('click', function () {

        toolsFilterButton.click();

        var groups_list = [];

        $('[data-attr="group_list_select"]').find("input[type='checkbox']:checked").each(function(){
            groups_list.push($(this).val());
        });

        var modules_list = [];

        $('[data-attr="module_list_select"]').find("input[type='checkbox']:checked").each(function(){
            modules_list.push($(this).val());
        });

        var region_list = [];

        $('[data-attr="region_list_select"]').find("input[type='checkbox']:checked").each(function(){
            region_list.push($(this).val());
        });

        var course_round;

        var filter_container_round = $('[data-attr="filter-container-round"]');

        if  (filter_container_round.find("select[name='round_list_select']").select2('data')[0]['id'] === '') {
            course_round = '';
        } else {
            course_round = filter_container_round.find("select[name='round_list_select']").select2('data')[0]['id'];
        }

        $('.statistic-header .statistic-center .item-header .statistic-item__module').remove();
        $('.statistic-body .statistic-left .statistic-item').remove();
        $('.statistic-body .statistic-center .statistic-item.item-group').remove();
        $('.statistic-summary [data-attr="summary-block"]').hide('slow').remove();
        $('#statistic_table').DataTable().destroy();
        $('#statistic_table thead tr').remove();
        $('#statistic_table tbody tr').remove();
        $('[data-attr="maxScoreOfActivities"]').remove();

        getResults(groups_list, modules_list, region_list, course_round);
        removeDraggableStyles($('.statistic-header .statistic-center .statistic-scroll'));
        removeDraggableStyles($('.statistic-body .statistic-center .statistic-scroll'));
        draggableTable();
    });

    function removeDraggableStyles(element) {
        element.css('width', '');
        element.css('right', '');
        element.css('left', '');
        element.css('top', '');
        element.css('position', '');
    }
    draggableTable();
    function draggableTable() {
        setTimeout(function(){
            if ($('.statistic-header .statistic-center').width() < $('.statistic-header .statistic-center .statistic-scroll').width()) {

                $('.statistic-header .statistic-center .statistic-scroll').css('position', 'relative');
                $('.statistic-body .statistic-center .statistic-scroll').css('position', 'relative');
                $('.statistic-header .statistic-center .statistic-scroll').draggable({
                    axis: 'x',
                    disabled: false,
                    cursor: 'pointer',
                    drag: function(event, ui) {

                        var left = ui.position.left,
                            offsetWidth = ($(this).width() - $(this).parent().width()) * -1;
                        if (left > 0) {
                            ui.position.left = 0;
                        }
                        if (offsetWidth > left) {
                            ui.position.left = offsetWidth;
                        }


                        var usersStatisticBlock = $('.statistic-body .statistic-center .statistic-scroll');
                        var headerStatisticDraggableBlock = $('.statistic-header .statistic-scroll.ui-draggable.ui-draggable-handle');
                        if (ui.position.left > 0) {
                            usersStatisticBlock.css('left', ui.originalPosition.left);
                        } else {
                            usersStatisticBlock.css('left', ui.position.left);
                        }

                        if (ui.position.left > offsetWidth) {
                            usersStatisticBlock.css('left', ui.originalPosition.right);
                        } else {
                            usersStatisticBlock.css('left', ui.position.right);
                        }
                        usersStatisticBlock.css('width', headerStatisticDraggableBlock.css('width'));
                        usersStatisticBlock.css('position', headerStatisticDraggableBlock.css('position'));
                        usersStatisticBlock.css('top', headerStatisticDraggableBlock.css('top'));

                    },
                    stop: function( event, ui ) {
                        var usersStatisticBlock = $('.statistic-body .statistic-center .statistic-scroll');
                        var headerStatisticDraggableBlock = $('.statistic-header .statistic-scroll.ui-draggable.ui-draggable-handle');

                        usersStatisticBlock.css('width', headerStatisticDraggableBlock.css('width'));
                        usersStatisticBlock.css('position', headerStatisticDraggableBlock.css('position'));
                        usersStatisticBlock.css('right', headerStatisticDraggableBlock.css('right'));
                        usersStatisticBlock.css('left', headerStatisticDraggableBlock.css('left'));
                        usersStatisticBlock.css('top', headerStatisticDraggableBlock.css('top'));
                    }
                });
                $('.statistic-body .statistic-center .statistic-scroll').mouseenter(function(){

                    $('.statistic-body .statistic-center .statistic-scroll').css('position', $('.statistic-header .statistic-center .statistic-scroll').css('position'));

                    $('.statistic-body .statistic-center .statistic-scroll').draggable({
                        disabled: false,
                        axis: 'x',
                        cursor: 'pointer',
                        drag: function(event, ui) {

                            var left = ui.position.left,
                                offsetWidth = ($(this).width() - $(this).parent().width()) * -1;

                            if (left > 0) {
                                ui.position.left = 0;
                            }
                            if (offsetWidth > left) {
                                ui.position.left = offsetWidth;
                            }

                            var usersStatisticDraggableBlock = $('.statistic-body .statistic-center .statistic-scroll.ui-draggable.ui-draggable-handle');
                            var headerStatisticBlock = $('.statistic-header .statistic-center .statistic-scroll');
                            if (ui.position.left > 0) {
                                headerStatisticBlock.css('left', ui.originalPosition.left);
                            } else {
                                headerStatisticBlock.css('left', ui.position.left);
                            }

                            if (ui.position.left > offsetWidth) {
                                headerStatisticBlock.css('left', ui.originalPosition.right);
                            } else {
                                headerStatisticBlock.css('left', ui.position.right);
                            }

                            headerStatisticBlock.css('width', usersStatisticDraggableBlock.css('width'));
                            headerStatisticBlock.css('position', usersStatisticDraggableBlock.css('position'));
                            headerStatisticBlock.css('top', usersStatisticDraggableBlock.css('top'));
                        },
                        stop: function( event, ui ) {
                            var usersStatisticDraggableBlock = $('.statistic-body .statistic-center .statistic-scroll.ui-draggable.ui-draggable-handle');
                            var headerStatisticBlock = $('.statistic-header .statistic-center .statistic-scroll');

                            headerStatisticBlock.css('width', usersStatisticDraggableBlock.css('width'));
                            headerStatisticBlock.css('position', usersStatisticDraggableBlock.css('position'));
                            headerStatisticBlock.css('right', usersStatisticDraggableBlock.css('right'));
                            headerStatisticBlock.css('left', usersStatisticDraggableBlock.css('left'));
                            headerStatisticBlock.css('top', usersStatisticDraggableBlock.css('top'));
                        },
                    });
                }).mouseleave(function(){
                    $(".statistic-body .statistic-center .statistic-scroll").draggable({
                        drag: function(event, ui) { return false; }
                    });
                });
            } else {

                $(".statistic-header .statistic-center .statistic-scroll").draggable({ disabled: true });
                $(".statistic-body .statistic-center .statistic-scroll").draggable({ disabled: true });
            }
        },500);
    }
});