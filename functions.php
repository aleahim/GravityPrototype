<?php

function SessionsList() {
    $db = Core::GetDB();

    $res = $db->Query('SELECT `report_id`, `title`, `date_created` FROM `reports` ORDER BY `date_created` DESC');

    $list = array();
    if ($res && $res->NumRows() > 0) {
        while ($row = $res->FetchAssoc()) {
            $list[] = $row;
        }
    }

    echo json_encode($list);
}

function Search() {
    $exclude = Core::GetFromPOST('exclude');
    $data = Core::GetFromPOST('data');
    $middle_point = intval(Core::GetFromPOST('middle_point'));

    $db = Core::GetDB();

    $result = array();

    $s_ids_middle = array();
    foreach ($data AS $grouping_point) {
        $op = strtolower($grouping_point['operator']);

        switch ($op) {
            case 'connected':
                $main_attr = $grouping_point['attrs'][0];

                $grouping_point['attrs'] = array();
                $res_mattr = $db->Query("SELECT DISTINCT `attr_name` FROM `data_xml_attributes` WHERE `data_xml_item_id` IN (SELECT `data_xml_item_id` FROM `data_xml_attributes` WHERE `attr_name` = ?)", array(
                    array(1, $main_attr, IDBController::PARAM_STR)
                        ));

                if ($res_mattr && $res_mattr->NumRows() > 0) {
                    while ($mattr = $res_mattr->FetchAssoc()) {
                        $grouping_point['attrs'][] = $mattr['attr_name'];
                    }
                }

                break;
        }

        $search_ids = array();
        foreach ($grouping_point['attrs'] AS $attr) {
            $s_id = $db->FetchSingle("SELECT IF(MAX(`s_id`), MAX(`s_id`), 0) + 1 AS `s_id` FROM `search`");

            $db->Query("
                            INSERT INTO
                                `search`
                                (`s_id`, `f_id`, `do_id`)
                            SELECT DISTINCT
                                {$s_id['s_id']}, `i`.`data_xml_feed_id`, `i`.`data_xml_item_id`
                            FROM
                                `data_xml_items` AS `i`
                                INNER JOIN
                                `data_xml_feeds` AS `f`
                                USING(`data_xml_feed_id`)
                                INNER JOIN
                                `data_xml_attributes` AS `attr`
                                USING(`data_xml_item_id`)
                            WHERE
                                `attr`.`attr_name` = ? AND `f`.`active` = 1", array(
                array(1, $attr, IDBController::PARAM_STR)
            ));

            $search_ids[] = $s_id['s_id'];
        }

        switch ($op) {
            case 'and':
                $cnt = count($search_ids);
                $query = 'SELECT DISTINCT `s0`.`f_id`, `s0`.`do_id` FROM ';
                $where = ' WHERE ';
                for ($i = 0; $i < $cnt; $i++) {
                    if ($i === 0) {
                        $query .= " `search` AS `s{$i}` ";
                        $where .= " `s{$i}`.`s_id` = {$search_ids[$i]} ";
                    } else {
                        $query .= " INNER JOIN `search` AS `s{$i}` USING(`do_id`) ";
                        $where .= " AND `s{$i}`.`s_id` = {$search_ids[$i]} ";
                    }
                }
                $query .= $where;

                break;
            case 'connected':
            case 'or':
                foreach ($search_ids AS $k => $s_id) {
                    $search_ids[$k] = "`s_id` = $s_id";
                }
                $query = "SELECT DISTINCT `s0`.`f_id`, `s0`.`do_id` FROM `search` AS s0 WHERE " . implode(" OR ", $search_ids);

                break;
        }

        $s_id = $db->FetchSingle("SELECT IF(MAX(`s_id`), MAX(`s_id`), 0) + 1 AS `s_id` FROM `search`");

        $query_middle = "INSERT INTO `search` (`s_id`, `f_id`, `do_id`) " .
                str_replace('SELECT DISTINCT `s0`.`f_id`, `s0`.`do_id`', "SELECT DISTINCT {$s_id['s_id']}, `s0`.`f_id`, `s0`.`do_id`", $query);

        $db->Query($query_middle);

        if ($middle_point) {
            $s_ids_middle[] = $s_id['s_id'];
        } else {
            $DOs = array();
            
            $exclude_query = empty($exclude) ? '' : " AND `do_id` NOT IN ($exclude)";

            $res = $db->Query("SELECT DISTINCT `f_id`, `do_id` FROM `search` WHERE `s_id` = {$s_id['s_id']} $exclude_query");
            if ($res && $res->NumRows() > 0) {
                while ($row = $res->FetchAssoc()) {
                    $DOs[] = array('f_id' => intval($row['f_id']), 'do_id' => intval($row['do_id']));
                }
            }

            $result = array_merge($result, $DOs);
        }
    }

    if ($middle_point) {
        $cnt = count($s_ids_middle);
        $query = 'SELECT DISTINCT `s0`.`f_id`, `s0`.`do_id` FROM ';
        $where = ' WHERE ';
        for ($i = 0; $i < $cnt; $i++) {
            if ($i === 0) {
                $query .= " `search` AS `s{$i}` ";
                $where .= " `s{$i}`.`s_id` = {$s_ids_middle[$i]} ";
            } else {
                $query .= " INNER JOIN `search` AS `s{$i}` USING(`do_id`) ";
                $where .= " AND `s{$i}`.`s_id` = {$s_ids_middle[$i]} ";
            }
        }
        $exclude_query = empty($exclude) ? '' : " AND `do_id` NOT IN ($exclude)";
        $query .= $where . $exclude_query;

        $DOs = array();
        $res = $db->Query($query);
        if ($res && $res->NumRows() > 0) {
            while ($row = $res->FetchAssoc()) {
                $DOs[] = array('f_id' => intval($row['f_id']), 'do_id' => intval($row['do_id']));
            }
        }

        $result = array_merge($result, $DOs);
    }

    $all_searches = array_merge($search_ids, $s_ids_middle);
    $all_searches = array_unique($all_searches);

    foreach ($all_searches AS $k => $s_id) {
        $all_searches[$k] = "`s_id` = $s_id";
    }

    $query = "DELETE FROM `search` WHERE " . implode(" OR ", $all_searches);

    $db->Query($query);

    if ($op == 'connected') {
        $result = array('connected' => $main_attr, 'result' => $result);
    }
    echo json_encode($result);
}

function LoadDataObject() {
    $id = intval(Core::GetFromGET('id'));

    $db = Core::GetDB();

    $data_object = $db->FetchAssocSingle("SELECT `data_xml_feed_id`, `data_xml_item_id`, `type`, `image`, `url`, `title`, `desc` FROM `data_xml_items` WHERE `data_xml_item_id` = $id LIMIT 1");

    $res_attrs = $db->Query("SELECT data_xml_feed_id,i.data_xml_item_id,data_xml_attr_id, attr_type, attr_name, attr_value FROM data_xml_attributes as atr LEFT JOIN data_xml_items as i USING(data_xml_item_id) WHERE i.data_xml_item_id = $id");

    $attrs = array();
    if ($res_attrs && $res_attrs->NumRows() > 0) {
        while ($attr = $res_attrs->FetchAssoc()) {
            $attrs[] = $attr;
        }
    }

    $output = array(
        'id' => $id,
        'data' => $data_object,
        'attrs' => $attrs
    );

    echo json_encode($output);
}

function ReportSave() {
    $db = Core::GetDB();

    $horizon_date = Core::GetFromPOST('horizon_active_date');
    $title = Core::GetFromPOST('title');
    $horizon_date = stripslashes($horizon_date);
    $horizon_date = stripslashes($horizon_date);

    $db->Query('INSERT INTO `reports` (`title`, `horizon_active_date`) VALUES (?, ?)', array(
        array(1, $title, IDBController::PARAM_STR),
        array(2, $horizon_date, IDBController::PARAM_STR)
    ));

    echo $db->GetLastInsertId();
}

function ReportSaveDataObject() {
    $report_id = intval(Core::GetFromPOST('report_id'));
    $data_object_id = intval(Core::GetFromPOST('data_object_id'));
    $feed_id = intval(Core::GetFromPOST('feed_id'));
    $report_grouping_point_id = intval(Core::GetFromPOST('report_grouping_point_id'));

    $db = Core::GetDB();

    $db->Query("
                    INSERT INTO
                        `report_data_objects`
                    (`report_id`, `data_object_id`, `feed_id`, `report_grouping_point_id`)
                        VALUES
                    (?, ?, ?, ?)
                    ", array(
        array(1, $report_id, IDBController::PARAM_INT),
        array(2, $data_object_id, IDBController::PARAM_INT),
        array(3, $feed_id, IDBController::PARAM_INT),
        array(4, $report_grouping_point_id, IDBController::PARAM_INT),
    ));
}

function ReportSaveGroupingPoint() {
    $report_id = intval(Core::GetFromPOST('report_id'));
    $name = Core::GetFromPOST('name');
    $color = Core::GetFromPOST('color');
    $operator = Core::GetFromPOST('operator');
    $in_gravity_trap = intval(Core::GetFromPOST('in_gravity_trap'));
    $workspace = intval(Core::GetFromPOST('workspace'));
    $data_objects_count = intval(Core::GetFromPOST('data_objects_count'));
    $sum1 = intval(Core::GetFromPOST('sum1'));
    $sum2 = intval(Core::GetFromPOST('sum2'));
    $coords_x = intval(Core::GetFromPOST('coords_x'));
    $coords_y = intval(Core::GetFromPOST('coords_y'));
    $is_result_point = intval(Core::GetFromPOST('is_result_point'));

    $db = Core::GetDB();

    $db->Query("INSERT INTO `report_grouping_points`
                    (`report_id`, `name`, `color`, `operator`, `in_gravity_trap`, `workspace`, `data_objects_count`, `sum1`, `sum2`, `coords_x`, `coords_y`, `is_result_point`)
                    VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", array(
        array(1, $report_id, IDBController::PARAM_INT),
        array(2, $name, IDBController::PARAM_STR),
        array(3, $color, IDBController::PARAM_STR),
        array(4, $operator, IDBController::PARAM_STR),
        array(5, $in_gravity_trap, IDBController::PARAM_INT),
        array(6, $workspace, IDBController::PARAM_INT),
        array(7, $data_objects_count, IDBController::PARAM_INT),
        array(8, $sum1, IDBController::PARAM_INT),
        array(9, $sum2, IDBController::PARAM_INT),
        array(10, $coords_x, IDBController::PARAM_INT),
        array(11, $coords_y, IDBController::PARAM_INT),
        array(12, $is_result_point, IDBController::PARAM_INT)
    ));

    echo $db->GetLastInsertId();
}

function ReportSaveGPAttrs() {
    $report_id = intval(Core::GetFromPOST('report_id'));
    $report_grouping_point_id = intval(Core::GetFromPOST('report_grouping_point_id'));
    $attr_type = Core::GetFromPOST('attr_type');
    $attr_name = Core::GetFromPOST('attr_name');
    $attr_value = Core::GetFromPOST('attr_value');
    $is_selected = intval(Core::GetFromPOST('is_selected'));

    $db = Core::GetDB();

    $db->Query("INSERT INTO `report_grouping_point_attrs`
                    (`report_id`, `report_grouping_point_id`, `attr_type`,`attr_name`,`attr_value`, `is_selected`)
                    VALUES
                    (?, ?, ?, ?, ?, ?)", array(
        array(1, $report_id, IDBController::PARAM_INT),
        array(2, $report_grouping_point_id, IDBController::PARAM_INT),
        array(3, $attr_type, IDBController::PARAM_STR),
        array(4, $attr_name, IDBController::PARAM_STR),
        array(5, $attr_value, IDBController::PARAM_STR),
        array(6, $is_selected, IDBController::PARAM_INT)
    ));
}

function ReportLoad() {
    $db = Core::GetDB();

    $report_id = Core::GetFromGET('report_id');
    $report_id = intval($report_id);

    $horizon_date = $db->FetchAssocSingle('SELECT horizon_active_date FROM reports WHERE report_id = ? LIMIT 1', array(
        array(1, $report_id, IDBController::PARAM_INT)
            ));

    $res_gps = $db->Query("
                    SELECT
                        `report_grouping_point_id`, `report_id`, `name`, `color`, `operator`, `in_gravity_trap`, `workspace`, `data_objects_count`, `sum1`, `sum2`, `coords_x`, `coords_y`, `is_result_point`
                    FROM
                        `report_grouping_points`
                    WHERE
                        `report_id` = $report_id
                    ORDER BY workspace ASC, data_objects_count DESC");

    $grouping_points = array();
    if ($res_gps && $res_gps->NumRows() > 0) {
        while ($grouping_point = $res_gps->FetchAssoc()) {
            $res_dos = $db->Query("SELECT `report_id`, `report_grouping_point_id`, `feed_id`, `data_object_id` FROM `report_data_objects` WHERE `report_grouping_point_id` = {$grouping_point['report_grouping_point_id']}");
            $data_objects = array();
            if ($res_dos && $res_dos->NumRows() > 0) {
                while ($data_object = $res_dos->FetchAssoc()) {
                    $data_objects[] = array(
                        'f_id' => $data_object['feed_id'],
                        'do_id' => $data_object['data_object_id']
                    );
                }
            }

            $grouping_point['data_objects'] = $data_objects;

            $res_attrs = $db->Query("SELECT `report_id`, `report_grouping_point_id`, `attr_type`, `attr_name`, `attr_value`, `is_selected` FROM `report_grouping_point_attrs` WHERE `report_grouping_point_id` = {$grouping_point['report_grouping_point_id']}");

            $attrs = array();
            if ($res_attrs && $res_attrs->NumRows() > 0) {
                while ($attr = $res_attrs->FetchAssoc()) {
                    $attrs[] = $attr;
                }
            }

            $grouping_point['attrs'] = $attrs;

            $grouping_points[] = $grouping_point;
        }
    }

    $output = array(
        'report_id' => $report_id,
        'horizon_active_date' => $horizon_date['horizon_active_date'],
        'grouping_points' => $grouping_points
    );

    echo json_encode($output);
}

function TimelineSave() {
    $db = Core::GetDB();

    $dates = Core::GetFromGET('dates');

    $db->Query('UPDATE timeline SET timeline_dates = ?', array(
        array(1, $dates, IDBController::PARAM_STR)
    ));
}

function TimelineLoad() {
    $db = Core::GetDB();

    $dates = $db->FetchAssocSingle('SELECT timeline_dates FROM timeline');

    echo $dates['timeline_dates'];
}

function MenuInsert() {
    $menu = Core::GetFromPOST('menu');
    if (count($menu)) {
        $db = Core::GetDB();

        $db->Query('TRUNCATE TABLE menu');

        foreach ($menu AS $attrs) {
            $attrs = explode(',', $attrs);

            foreach ($attrs AS &$attr) {
                $attr = fix_attr($attr);
            }

            $db->Query("INSERT INTO menu (level1, level2, level3, attr_name) VALUES(?, ?, ?, ?)", array(
                array(1, $attrs[0], IDBController::PARAM_STR),
                array(2, $attrs[1], IDBController::PARAM_STR),
                array(3, $attrs[2], IDBController::PARAM_STR),
                array(4, $attrs[3], IDBController::PARAM_STR),
            ));
        }
    }
}

function MenuOutputForEdit() {
    $db = Core::GetDB();

    $res = $db->Query("SELECT * FROM menu ORDER BY level1, level2, level3, attr_name");
    while ($row = $res->FetchAssoc()) {
        echo $row['level1'] . ',' . $row['level2'] . ',' . $row['level3'] . ',' . $row['attr_name'] . "\n";
    }
}

function MenuOutput() {
    $db = Core::GetDB();

    $menu = array();

    $res = $db->Query("SELECT * FROM menu ORDER BY level1, level2, level3, attr_name");
    while ($row = $res->FetchAssoc()) {
        $menu[$row['level1']][$row['level2']][$row['level3']][] = $row['attr_name'];
    }

    echo json_encode($menu);
    exit;
}

function Run() {
    if (Core::GetFromGET('url')) {
        preg_match('@do=run&name=(.*?)&url=(.*)@', $_SERVER['REQUEST_URI'], $m);

        if (empty($m[1]) === false && empty($m[2]) === false) {
            $m[1] = urldecode($m[1]);
            Core::Exec(PATH_PHP . PATH_EXEC . DS . "ai.php \"{$m[1]}\" \"{$m[2]}\"");
        }
    }
}

function CrawlURL() {
    $db = Core::GetDB();

    $url = $_GET['url'];
    $item = new stdClass();

    if (strpos($url, 'youtube.com') !== false) {
        chdir(PATH_LIBS);
        require_once PATH_LIBS . DS . 'Zend' . DS . 'Loader.php';
        require_once PATH_LIBS . DS . 'Zend' . DS . 'Gdata' . DS . 'YouTube.php';

        $yt = new Zend_Gdata_YouTube();
        $yt->setMajorProtocolVersion(2);

        preg_match('@watch\?v=(.*?)(\&|$)@', $url, $m);

        $videoID = $m[1];

        $videoEntry = $yt->getVideoEntry($videoID);

        $item->title = $videoEntry->getVideoTitle();
        $item->type = 'video';
        $item->date = date("m-d-Y", strtotime($videoEntry->getUpdated()->getText()));
        $item->desc = ''; //$videoEntry->getVideoDescription();
        $item->attrs = $videoEntry->getVideoTags();
        $item->num1 = $videoEntry->getVideoViewCount();
        $item->num2 = $videoEntry->getVideoRatingInfo();
        $item->num2 = $item->num2['average'];
        $item->url = str_replace(array('https://', '&feature=youtube_gdata_player'), array('http://', ''), $videoEntry->getVideoWatchPageUrl());

        $images = array();

        $videoThumbnails = $videoEntry->getVideoThumbnails();
        foreach ($videoThumbnails as $videoThumbnail) {
            $images[] = $videoThumbnails[0]['url'];
        }

        $item->images = $images;
    } else {
        $horizon_date = file_get_contents($url);

        preg_match('@<title>(.*?)</title>@ms', $horizon_date, $m);


        $item->title = $m[1];
        $item->type = 'article';

        $dates = array();
        preg_match_all('@[0-9]{2}[/\.-]{1}[0-9]{2}[/\.-]{1}[0-9]{4}@', $horizon_date, $m);
        foreach ($m[0] AS $date) {
            if (!isset($dates[$date]))
                $dates[$date] = 0;
            $dates[$date]++;
        }
        asort($dates);
        $dates = array_keys($dates);
        $item->date = array_pop($dates);
        $item->desc = '';
        $item->attrs = array();
        $item->num1 = 0;
        $item->num2 = 0;
        $item->url = $url;

        preg_match_all('@<img.*?src=[\'"](.*?)[\'"].*?>@ms', $horizon_date, $m);
        foreach ($m[1] as $image) {
            $images[] = $image;
        }

        $item->images = $images;
    }

    echo json_encode($item);
}

function LoadAttributes($id) {
    $id = intval($id);

    $db = Core::GetDB();

    $res_attrs = $db->Query("SELECT `data_xml_attr_id`, `data_xml_item_id`, `attr_type`, `attr_name`, `attr_value` FROM `data_xml_attributes` WHERE `data_xml_item_id` = $id");

    if ($res_attrs && $res_attrs->NumRows() > 0) {
        $attrs = array();
        while ($attr = $res_attrs->FetchAssoc()) {
            $attrs[] = $attr;
        }

        return $attrs;
    } else {
        echo -1;
    }
}

function LoadDataObjects() {
    $ids = Core::GetFromPOST('ids');

    $DOs = array();

    if (is_array($ids) && count($ids) > 0) {
        $ids = array_map('intval', $ids);

        $db = Core::GetDB();

        $res = $db->Query("
            SELECT
                `data_xml_feed_id`, `data_xml_item_id`, `type`, `image`, `url`, `title`, `desc`
            FROM
                `data_xml_items`
            WHERE
                `data_xml_item_id` IN (" . implode(',', $ids) . ")");

        if ($res && $res->NumRows() > 0) {
            while ($row = $res->FetchAssoc()) {
                $id = $row['data_xml_item_id'];
                $attrs = LoadAttributes($id);
                $data = $row;

                $DOs[] = array(
                    'id' => $id,
                    'attrs' => $attrs,
                    'data' => $data
                );
            }
        }
    }

    echo json_encode($DOs);
}

function DeleteDataObject() {
    $id = Core::GetFromGET('id');

    $db = Core::GetDB();

    $db->Query('DELETE data_xml_attributes, data_xml_items FROM data_xml_items LEFT JOIN data_xml_attributes USING(data_xml_item_id) WHERE data_xml_item_id = ' . $id);
}

function FeedAppend() {
    $db = Core::GetDB();

    $id = intval(Core::GetFromPOST('id'));
    $data_xml_feed_id = $id;

    try {
        $db->BeginTransaction();

        $data_list = Core::GetFromPOST('data');

        $data_list = array_filter(explode('@', $data_list));

        foreach ($data_list AS $horizon_date) {
            $element = explode(',', $horizon_date);
            if (count($element) != 8) {
                continue;
            }

            $data_id = $element[0];
            $data_processed_id = $element[1];
            $type = urldecode($element[2]);
            $image = urldecode($element[3]);
            $url = urldecode($element[4]);
            $title = urldecode($element[5]);
            $desc = urldecode($element[6]);
            $attrs = array_filter(explode(';', $element[7]));

            $filename = md5($image . time());

            $path = PATH_DATA_IMAGES . DS . $filename;

            file_put_contents($path, file_get_contents($image));

            $image = URL_DATA_IMAGES . $filename;

            $res = $db->Query("INSERT INTO
                data_xml_items
                (`data_xml_feed_id`, `data_id`, `data_processed_id`, `type`, `group_crawl_by_time_id`, `group_crawl_id`, `image`, `url`, `title`, `desc`)
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ", array(
                array(1, $data_xml_feed_id, IDBController::PARAM_INT),
                array(2, $data_id, IDBController::PARAM_INT),
                array(3, $data_processed_id, IDBController::PARAM_INT),
                array(4, $type, IDBController::PARAM_STR),
                array(5, 0, IDBController::PARAM_INT),
                array(6, 0, IDBController::PARAM_INT),
                array(7, $image, IDBController::PARAM_STR),
                array(8, $url, IDBController::PARAM_STR),
                array(9, $title, IDBController::PARAM_STR),
                array(10, $desc, IDBController::PARAM_STR),
                    ));
            if ($res->NumRows() == 0) {
                throw new Exception('add item err');
            }

            $data_xml_item_id = $db->GetLastInsertId();

            foreach ($attrs AS $k => $attr) {
                $attr = explode(':', $attr);

                if (count($attr) != 3) {
                    continue;
                }

                $attr[0] = urldecode($attr[0]);
                $attr[1] = urldecode($attr[1]);
                $attr[2] = urldecode($attr[2]);

                $attrs[$k] = implode(':', $attr);
            }

            $attrs = fix_attrs($attrs);

            foreach ($attrs AS $attr) {
                if (is_array($attr)) {
                    continue;
                }
                $attr = explode(':', $attr);

                if (count($attr) !== 3) {
                    continue;
                }
                if (empty($attr[0]) || empty($attr[1]) || empty($attr[2])) {
                    continue;
                }

                $res = $db->Query("INSERT INTO
                        data_xml_attributes
                        (data_xml_item_id, attr_type, attr_name, attr_value)
                        VALUES
                        (?, ?, ?, ?)", array(
                    array(1, $data_xml_item_id, IDBController::PARAM_INT),
                    array(2, $attr[2], IDBController::PARAM_STR),
                    array(3, $attr[0], IDBController::PARAM_STR),
                    array(4, $attr[1], IDBController::PARAM_INT)
                        ));
                if ($res === false) {
                    throw new Exception('add attr err');
                }
            }
        }
    } catch (Exception $e) {
        $db->RollbackTransaction();
        echo '<pre>';
        var_dump($e);
        echo '</pre>';
        exit;
    }

    $db->CommitTransaction();
}

function FeedInput() {
    $db = Core::GetDB();

    $id = intval(Core::GetFromGET('id'));

    try {
        $db->BeginTransaction();

        if ($id != 0) {
            $db->Query("DELETE data_xml_feeds, data_xml_items, data_xml_attributes FROM data_xml_feeds LEFT JOIN data_xml_items USING(data_xml_feed_id) LEFT JOIN data_xml_attributes USING(data_xml_item_id) WHERE data_xml_feed_id = $id");
        }

        $group_name = urldecode(Core::GetFromGET('name'));
        $feed_image = urldecode(Core::GetFromGET('image'));
        $feed_type = urldecode(Core::GetFromGET('type'));
        $feed_by_time = Core::GetFromGET('by_time');
        $feed_notes = urldecode(Core::GetFromGET('notes'));
        $feed_active = Core::GetFromGET('active');
        $feed_date = strtotime(Core::GetFromGET('date'));
        if ($id != 0) {
            $db->Query("INSERT INTO
                        data_xml_feeds
                        (data_xml_feed_id, group_crawl_by_time_id, title, time_added, image, type, active, notes)
                        VALUES
                        (?, ?,?,?,?,?,?,?)", array(
                array(1, $id, IDBController::PARAM_INT),
                array(2, $feed_by_time, IDBController::PARAM_INT),
                array(3, $group_name, IDBController::PARAM_STR),
                array(4, $feed_date, IDBController::PARAM_INT),
                array(5, $feed_image, IDBController::PARAM_STR),
                array(6, $feed_type, IDBController::PARAM_STR),
                array(7, $feed_active, IDBController::PARAM_INT),
                array(8, $feed_notes, IDBController::PARAM_STR),
            ));
            $data_xml_feed_id = $id;
        } else {
            $db->Query("INSERT INTO
                        data_xml_feeds
                        (group_crawl_by_time_id, title, time_added, image, type, active, notes)
                        VALUES
                        (?,?,?,?,?,?,?)", array(
                array(1, $feed_by_time, IDBController::PARAM_INT),
                array(2, $group_name, IDBController::PARAM_STR),
                array(3, $feed_date, IDBController::PARAM_INT),
                array(4, $feed_image, IDBController::PARAM_STR),
                array(5, $feed_type, IDBController::PARAM_STR),
                array(6, $feed_active, IDBController::PARAM_INT),
                array(7, $feed_notes, IDBController::PARAM_STR),
            ));
            $data_xml_feed_id = $db->GetLastInsertId();
        }
    } catch (Exception $e) {
        $db->RollbackTransaction();

        var_dump($e);
        exit;
    }

    $db->CommitTransaction();
    echo $data_xml_feed_id;
}

function DataObjectExists() {
    $db = Core::GetDB();

    $title = urldecode(Core::GetFromGET('title'));

    $res = $db->Query("SELECT 1 FROM data_xml_items WHERE title = ? LIMIT 1", array(
        array(1, $title, IDBController::PARAM_STR)
            ));

    echo $res->NumRows();
}

// DEPRECATED polzva se ot klasa za syzdavane na feedove v apps
function AddAttr() {
    $db = Core::GetDB();

    $title = urldecode(Core::GetFromPOST('title'));

    $res = $db->Query("SELECT data_xml_item_id FROM data_xml_items WHERE title = ? LIMIT 1", array(
        array(1, $title, IDBController::PARAM_STR)
            ));
    $id = $res->FetchRow();
    $id = $id[0];

    $attrs = array(urldecode(Core::GetFromPOST('attr')));

    $attrs = fix_attrs($attrs);

    foreach ($attrs AS $attr) {
        $attr = explode(':', $attr);

        if (count($attr) == 3) {
            if (empty($attr) === false) {
                $db->Query("DELETE FROM data_xml_attributes WHERE data_xml_item_id = $id AND attr_name='{$attr[0]}' LIMIT 1");
                $db->Query("INSERT INTO data_xml_attributes (data_xml_item_id, attr_name, attr_value, attr_type) VALUES ($id, '{$attr[0]}', '{$attr[1]}', '{$attr[2]}')");
            }
        }
    }
}

// polzwa se za tagirane
function AddAttribute() {
    $db = Core::GetDB();

    $id = Core::GetFromPOST('id');
    $attrs = Core::GetFromPOST('attrs');

    $attrs = fix_attrs($attrs);

    foreach ($attrs AS $attr) {
        $attr = explode(':', $attr);

        if (count($attr) == 3) {
            if (empty($attr) === false) {
                $db->Query("DELETE FROM data_xml_attributes WHERE data_xml_item_id = $id AND attr_name='{$attr[0]}' LIMIT 1");
                $db->Query("INSERT INTO data_xml_attributes (data_xml_item_id, attr_name, attr_value, attr_type) VALUES ($id, '{$attr[0]}', '{$attr[1]}', '{$attr[2]}')");
            }
        }
    }
}

function GetRawFeeds() {
    $feeds = array();

    $db = Core::GetDB();

    $res = $db->Query("SELECT data_xml_feed_id, title, time_added, image, type, active, notes FROM data_xml_feeds");
    while ($row = $res->FetchAssoc()) {
        $feeds[] = implode('@@DELIM_COLS@@', $row);
    }

    $feeds = implode('@@DELIM_ROWS@@', $feeds);

    echo $feeds;
}

function GetRawItems() {
    $dbid = Core::GetFromPOST('dbid');

    $feeds = array();

    $db = Core::GetDB();

    $res = $db->Query("SELECT data_xml_feed_id,data_xml_item_id, `type`, image, url, title, `desc` FROM data_xml_items WHERE data_xml_feed_id = $dbid");
    while ($row = $res->FetchAssoc()) {
        $feeds[] = implode('@@DELIM_COLS@@', $row);
    }

    $feeds = implode('@@DELIM_ROWS@@', $feeds);

    echo $feeds;
}

function GetRawAttrs() {
    $dbid = Core::GetFromPOST('dbid');

    $feeds = array();

    $db = Core::GetDB();

    $res = $db->Query("SELECT data_xml_feed_id,i.data_xml_item_id,data_xml_attr_id, attr_type, attr_name, attr_value FROM data_xml_attributes as atr LEFT JOIN data_xml_items as i USING(data_xml_item_id) WHERE i.data_xml_item_id = $dbid");
    while ($row = $res->FetchAssoc()) {
        $feeds[] = implode('@@DELIM_COLS@@', $row);
    }

    $feeds = implode('@@DELIM_ROWS@@', $feeds);

    echo $feeds;
}

function SetRawFeeds() {
    $db = Core::GetDB();

    $horizon_date = Core::GetFromPOST('data');

    $horizon_date = array_filter(explode('@@DELIM_ROWS@@', $horizon_date));

    foreach ($horizon_date AS $dbrow) {
        $row = explode('@@DELIM_COLS@@', $dbrow);

        $id = array_shift($row);

        if ($id == '*') {
            $db->Query("INSERT INTO `data_xml_feeds`
                            (`title`, `time_added`, `image`, `type`, `active`, `notes`)
                            VALUES
                            ('{$row[0]}', '{$row[1]}', '{$row[2]}', '{$row[3]}', '{$row[4]}', '{$row[5]}')");
        } else {
            $db->Query("UPDATE `data_xml_feeds` SET
                            `title` = '{$row[0]}', `time_added` = '{$row[1]}', `image` = '{$row[2]}', `type` = '{$row[3]}', `active` = '{$row[4]}', `notes` = '{$row[5]}'
                            WHERE `data_xml_feed_id` = $id");
        }
    }
}

function SetRawItems() {
    $db = Core::GetDB();

    $dbid = Core::GetFromPOST('dbid');
    $horizon_date = Core::GetFromPOST('data');

    $horizon_date = array_filter(explode('@@DELIM_ROWS@@', $horizon_date));

    foreach ($horizon_date AS $dbrow) {
        $row = explode('@@DELIM_COLS@@', $dbrow);

        array_shift($row); // feed id
        $id = array_shift($row);

        foreach ($row AS &$r) {
            $r = urldecode($r);
        }

        if ($id == '*') {
            $db->Execute("INSERT INTO `data_xml_items`
                            (`data_xml_feed_id`, `type`, `image`, `url`, `title`, `desc`)
                            VALUES
                            ($dbid, '{$row[0]}', '{$row[1]}', '{$row[2]}', '{$row[3]}', '{$row[4]}')");
            echo "INSERT INTO `data_xml_items`
                            (`data_xml_feed_id`, `type`, `image`, `url`, `title`, `desc`)
                            VALUES
                            ($dbid, '{$row[0]}', '{$row[1]}', '{$row[2]}', '{$row[3]}', '{$row[4]}')";
        } else {
            $db->Execute("UPDATE `data_xml_items` SET
                            `type` = '{$row[0]}', `image` = '{$row[1]}', `url` = '{$row[2]}', `title` = '{$row[3]}', `desc` = '{$row[4]}'
                            WHERE `data_xml_item_id` = $id");
        }
    }
}

function SetRawAttrs() {
    $db = Core::GetDB();

    $dbid = Core::GetFromPOST('dbid');
    $horizon_date = Core::GetFromPOST('data');

    $horizon_date = array_filter(explode('@@DELIM_ROWS@@', $horizon_date));

    foreach ($horizon_date AS $dbrow) {
        $row = explode('@@DELIM_COLS@@', $dbrow);

        array_shift($row); // feed id
        array_shift($row); // data object id
        $id = array_shift($row);

        if ($id == '*') {
            $db->Query("INSERT INTO `data_xml_attributes`
                            (`data_xml_item_id`, `attr_type`, `attr_name`, `attr_value`)
                            VALUES
                            ($dbid, '{$row[0]}','{$row[1]}','{$row[2]}')");
        } else {
            $db->Query("UPDATE `data_xml_attributes` SET
                            `attr_type` = '{$row[0]}', `attr_name` = '{$row[1]}', `attr_value` = '{$row[2]}'
                            WHERE `data_xml_attr_id` = $id");
        }
    }
}

function ListFeeds() {
    $db = Core::GetDB();

    $IDs = array();

    $res = $db->Query("SELECT f.*, count(*) FROM data_xml_feeds AS f LEFT JOIN data_xml_items AS i USING(data_xml_feed_id) GROUP BY data_xml_feed_id HAVING active = 1 ORDER BY f.time_added ASC,f.type");

    if ($res !== false && $res->NumRows() > 0) {
        while ($row = $res->FetchRow()) {
            $gres = $db->Query("SELECT group_id FROM data_xml_feeds LEFT JOIN group_crawl_by_time_crawls USING(group_crawl_by_time_id) LEFT JOIN crawls USING(crawl_id) LEFT JOIN group_crawls USING(group_crawl_id) LEFT JOIN groups USING(group_id) WHERE group_crawl_by_time_id = {$row[1]}");

            $pics = array();
            $elements_ids = array();

            $pres = $db->Query("SELECT image, data_xml_item_id FROM data_xml_items WHERE data_xml_feed_id = {$row[0]} LIMIT 16");
            while ($pic = $pres->FetchRow()) {
                $pics[] = $pic[0];
                $elements_ids[] = $pic[1];
            }
            $row[] = implode('@@delim@@', $pics);
            if ($gres->NumRows()) {
                $g = $gres->FetchRow();
                $row[] = $g;
            }

            $row[] = implode('@@delim@@', $elements_ids);

            $row[3] = date("d/m/y H:i", $row[3]);
            $IDs[] = $row;
        }
    }

    echo json_encode($IDs);
}

function ListWords() {
    //case 'list-words':
    $db = Core::GetDB();

    $res = $db->Query("SELECT word, word_group_id
FROM `words_word_groups`
LEFT JOIN words
USING ( word_id ) where word_group_id=1");

    $output = array();

    if ($res !== false && $res->NumRows() > 0) {
        while ($row = $res->FetchRow()) {
            $output[] = $row;
        }
    }

    echo json_encode($output);
}

function AddAction() {
    $db = Core::GetDB();

    $db->Query("INSERT INTO procedures (description, command_file) VALUES (?, ?)", array(
        array(1, Core::GetFromGET('desc'), IDBController::PARAM_STR),
        array(2, Core::GetFromGET('cmd'), IDBController::PARAM_STR),
    ));
}

function OutputCMD() {
    //case 'output-cmd':
    $db = Core::GetDB();

    $cmdres = $db->Query("SELECT * FROM procedures WHERE procedure_id = ?", array(
        array(1, Core::GetFromGET('id'), IDBController::PARAM_INT)
            ));
    $output = $cmdres->FetchRow();

    echo json_encode($output);
}

function ListActions() {
    //case 'list-actions':
    $db = Core::GetDB();

    $procs = array();

    $procres = $db->Query("SELECT * FROM procedures");
    while ($row = $procres->FetchRow()) {
        $procs[] = $row;
    }

    echo json_encode($procs);
}

function Output() {
    $db = Core::GetDB();

    $id = intval(Core::GetFromPOST('data_xml_feed_id'));
    $exclude = Core::GetFromPOST('exclude');
    if (empty($exclude) === false) {
        $exclude = " AND data_xml_item_id NOT IN ($exclude)";
    }
    $limit = 0;
    $load = true;
    while ($load) {
        $load = false;
        $res = $db->Query("SELECT data_xml_item_id FROM data_xml_items WHERE data_xml_feed_id = $id $exclude LIMIT $limit, 50");
        while ($row = $res->FetchRow()) {
            echo $row[0] . ';';

            $load = true;
        }
        $res->FreeResult();
        //gc_collect_cycles();
        $limit += 50;
    }
}

?>