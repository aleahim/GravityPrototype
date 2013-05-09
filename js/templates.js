// DATA OBJECT
$.template('data_object_vis_icon', '<table cellspacing="0" cellpadding="0"><tr><td rowspan="2"><img id="${MOVEUID}" class="main_img" src="${main_img_src}" alt="${main_img_alt}" /></td><td><div>${title}</div></td></tr><tr><td><div><a class="do_url" href="${url}" target="_blank">${url_title}</a></div></td></tr></table>');
$.template('data_object_box', '<div id="${UID}" class="img_container"></div>');
$.template('data_object_attrs_list', '<div id="${UID}" class="do_attr_list attr_list"></div>');
$.template('gp_attrs_list', '<div id="${UID}" class="gp_attr_list attr_list"><input type="text" /></div>');
$.template('data_object_attr', '<div id="${UID}" data-attrUID="${attrUID}">${attr}</div>');
// SEARCH BAR DIV
$.template('search_bar_vis', '<div id="${UID}"></div>');
// CONTAINER
$.template('attr_menu_tpl', '\
<div id="clickarea_${HTMLid}" class="clickarea"><img src="pics/plus_icon.png" alt="+" /></div>\
<div id="${HTMLid}" class="container">\
    <div class="cont_title clearfix">\
	<div id="attrs_${HTMLid}" class="attrs"></div>\
    </div>\
        <div id="buttons_${HTMLid}" class="buttons">\
            <div><img src="pics/GP/g.png" alt="Start Grouping" id="spyglass_${AttrMenuID}" /></div>\n\
            <div><img src="pics/GP/db.png" alt="Dynamic Search" id="container_db_${HTMLid}" /></div>\n\
            <div><img src="pics/GP/sum.png" alt="Sum" id="container_sum_${HTMLid}" /></div>\n\
            <div><img src="pics/GP/close.png" alt="Close" id="container_close_${HTMLid}" /></div>\n\
        </div>\n\
        <div class="elements"></div>\n\
    <div id="resize_${HTMLid}" class="resize"><img src="pics/GP/resize.gif" alt="resize" /></div>\n\
</div>\
');
$.template('session_line', '<tr><td>${title}</td><td>${date}</td><td class="right"><span onclick="Session.Load(${id})">Load</span></td><td class="right"><span onclick="Report.OpenReport(${id})">Open</span></td></tr>');
$.template('popup', '<div class="popup popup_${direction}" id="${UID}"><div class="popup_think_smaller"></div><div class="popup_think_small"></div><div class="popup_think_big">${text}</div></div>');
$.template('server_load_dialog', '<div id="feed_dialog" title="Results for: ${title}" class="server_load_dialog"></div>');
$.template('server_load_dialog_close', '<div style="float:none;clear: both"></div><input type="button" value="Close" onclick="$(\'#feed_dialog\').dialog(\'destroy\');$(\'#feed_dialog\').remove()" />');
$.template('server_load_dialog_load', '<input type="button" value="Load All (${count})" onclick="$(\'#feed_dialog\').dialog(\'destroy\');$(\'#feed_dialog\').remove();FeedPanel.RemoveLoadPanel();ServerLoading.Confirm();" />');
$.template('server_load_dialog_brick', '<div id="${id}">\n\
<table>\n\
<tr>\n\
<td rowspan="2"><img src="${image}" /></td><td valign="top">${title}</td>\n\
<tr><td><span class="small">${label}</span></td></tr>\n\
</tr>\n\
</table></div>');
$.template('server_load_dialog_delim', '<div style="float:none;clear: both"></div>');
$.template('arrow_down', '<img src="pics/arrow_down.ico" class="arrow_down" id="${id}" />');
$.template('arrow_up', '<img src="pics/arrow_up.ico" class="arrow_up" id="${id}" />');
$.template('carousel_container', '<div id="${id}"></div>');
$.template('feed_panel', '<div id="left_panel">\
<div id="container_create"><div><img src="pics/plus_icon.png" alt="+" /></div></div>\n\
<div id="feed_panel" class="carousel"></div>\n\
<div id="wormhole">Wormhole<img src="pics/BottomPanel/black_hole.png" alt="Black Hole" /></div>\n\
</div>');
$.template('load_panel', '<div id="load_panel_frame"><div id="load_panel_attrs"></div><div id="load_panel" class="carousel"></div></div>');
$.template('feed_panel_brick', "<div id='${UID}'><img bindchange='Image' /><span class='el_label' bindchange='ElementsLabel'></span><span class='title' bindchange='Title'></span></div>");
$.template('feed_panel_delim', "<tr><th>${feed}</th></tr>");
$.template('feed_panel_tooltip', "<h1>${type} - ${title}</h1><h2>${date}</h2><h2>Total items in feed: ${count}</h2>");
$.template('gravity_trap', '<div id="gravity_trap"><span id="gravity_trap_label">Gravity Trap</span></div>');
$.template('attribute_old', "<div class='attr_sub_menu' id='attr_sub_menu_${FULLid}' onclick = 'Containers.get(\"${CONTid}\").SelectAttribute(\"${ATTRid}\")'>${attr_name}</p></div>");
$.template('oneLevelMenu', '<ul id="menu_${FULLid}" class="sf-menu sf-vertical"></ul>');
$.template('oneLevelMenu_attr', "<li id='attr_sub_menu_${FULLid}'><a href='javascript:Containers.get(\"${CONTid}\").SelectAttribute(\"${ATTRid}\")'>${attr_name}</li>");
//INSTANT SEARCH WINDOW
//$.template('results_for','<span id="results_for">Results for ${GP}</span>' );

$.template('not_instant_search_list_item', '<tr class="${f_id}">\
												<td rowspan="2">\
													<img src="${img_url}" alt="feed_img" height="60" width="60">\
												</td>\
												<td>${feed_name}</td>\
											<tr class="${f_id}">\
												<td class"fullness">\
													${items_to_load}/${total_elements}\
												</td>\
											</tr>\ ');
//REPORT
$.template('report_num', '<li>${items}</li><li>S1 ${sum1}</li><li>S2 ${sum2}</li>');
$.template('report', '<table id="${GP_id}" cellspacing="0" cellpadding="0" class="table_report"></table>');
$.template('report_headline', '<tr>\n\
									<td valign="top" >\n\
										<input type="checkbox"  name="checkUncheckAll" id="GP${GP_id}" onclick="CheckAll(${GP_id})" {{if is_selected}}checked="checked"{{/if}} />\n\
									</td>\n\
									<td></td>\n\
									<td colspan="2" style="color:${color};font-weight:bold;">${expression} {{if operator && operator!="and"}}(${operator}){{/if}} QNT ${length}</td>\n\
									<td>${num1}</td>\n\
									<td>${num2}</td>\n\
									<td></td>\n\
									<td></td>\n\
								</tr>\n\
								<tr>\n\
									<td style="width: 5px;"></td>\n\
									<td style="width: 30px;"></td>\n\
									<td style="font-size:9px;font-style:italic; width: 60px;">Date</td>\n\
									<td style="font-size:9px;font-style:italic;">Title</td>\n\
									<td style="font-size:9px;font-style:italic; width: 50px;">Num1</td>\n\
									<td style="font-size:9px;font-style:italic; width: 50px;">Num2</td>\n\
									<td style="width: 40px;"></td>\n\
									<td style="width: 40px;"></td>\n\
								</tr>');
$.template('report_line', '<tr>\n\
								<td valign="top">\n\
									<input type="checkbox" name="selected[]" value="${item_id}" {{if is_selected}}checked="checked"{{/if}} />\n\
								</td>\n\
								<td valign="top"><img src="${img}" style="border: 2px solid ${color};"/></td>\n\
								<td valign="top" style="font-size:15px;">${date}</td>\n\
								<td valign="top" style="font-size:22px;" >${headline}<br />\n\
									<span style="font-size:15px;color:grey;">${attrs}</span>\n\
								</td>\n\
								<td valign="top">${num1}</td>\n\
								<td valign="top">${num2}</td>\n\
								<td valign="top">\n\
									<a href="${url}" target="_blank" style="color:black; text-decoration:none;">LINK</a>\n\
								</td>\n\
								<td valign="top">\n\
									<span onclick="fillPopUp(${item_id})" style="cursor: pointer;">EDIT</span>\n\
								</td>\n\
							</tr>\n\
						');
$.template('report_horizon', '<tr><th colspan="7">EVENT HORIZON - ${date}</th></tr>');
// TOOLTIPS
$.template('mouse_tooltip', "<table id='${tableID}' class='element_tooltip'>\n\
    <tr>\n\
        <td valign='top' rowspan='4' style='width:100px; padding-right: 10px;'>\n\
            <img src='${src}' alt='Image preview' width='100' height='100' />\n\
        </td>\n\
    </tr>\n\
    <tr>\n\
        <td valign='top'>\n\
            <h2 style='padding:0;margin:0'>${info_title}</h2>\n\
        </td>\n\
    </tr>\n\
    <tr>\n\
        <td valign='top'>\n\
            <span style='padding:0;margin:0;font-style:italic;font-weight: bold;'>${date}</span>\n\
        </td>\n\
    </tr>\n\
    <tr>\n\
        <td valign='bottom'>\n\
            <h3 style='color:#ff6600;padding:0;margin:0;'>${feed}</h3>\n\
        </td>\n\
    </tr>\n\
<tr><td colspan='2'>\n\
<h3 style='width:300px;overflow:hidden;'>${urlstr}</h3>\n\
</td>\n\
</tr>\n\
<tr>\n\
<td colspan='2' style='width:300px;overflow:hidden;' class='do_attr_list attr_list' id='do_tooltip_attrs'></td>\n\
</tr>\n\
</table>");
$.template('touch_tooltip', "\
<table border='0' id='${tableID}'>\n\
<tr>\n\
<td valign='top' align='left' width='90'><img src='${src}' alt='Image preview' width='90' height='90' /></td>\n\
<td valign='top' align='left'><h2 style='padding:0;margin:0'>${info_title}</h2><h3>${feed}; ${date}</h3><h3>${urlstr}</h3></td>\n\
<td valign='top' align='right' width='90'>${c}</td>\n\
</tr\n\
table>");
$.template('mouse_feed_tooltip', "\
<table id='${tableID}' class='tooltip_box_clickarea'>\n\
<tr>\n\
<td valign='top' align='left' ><h1>${type} - ${title}</h1></td>\n\
</tr>\n\
<tr>\n\
<td valign='top' align='left' >${date}</td>\n\
</tr>\n\
<tr>\n\
<td valign='top' align='left' >Total items in feed: ${count}</td>\n\
</tr>\n\
<tr>\n\
<td class='feed_images' valign='top' align='left' ></td>\n\
</tr>\n\
</table>");
$.template('mouse_normal_tooltip', "<table id='${tableID}' class='${tooltip_class}'>\n\
    <tr>\n\
        <td class='tooltip_visualization' valign='top' rowspan='4' style=' padding-left: 10px;'>\n\
            <img src='${src}' alt='Image preview' width='150' height='150' /> <span class='playBytton'><img src='pics/play.png' width='60'/></span>\n\
        </td>\n\
    </tr>\n\
    <tr>\n\
        <td valign='top'>\n\
            <h2 style='padding:0;margin:0'>${info_title}</h2>\n\
        </td>\n\
    </tr>\n\
    <tr>\n\
        <td valign='top'>\n\
            <h3 style='color:#ff6600;padding:0;margin:0;'>${feed}</h3>\n\
        </td>\n\
    </tr>\n\
    <tr>\n\
        <td valign='top'>\n\
            <span style='padding:0;margin:0;font-style:italic;font-weight: bold;'>${date}</span>\n\
        </td>\n\
    </tr>\n\
<tr><td colspan='2'>\n\
<h3 style='width:300px;overflow:hidden;'>${urlstr}</h3>\n\
</td>\n\
</tr>\n\
<tr>\n\
<td colspan='2' style='width:300px;overflow:hidden;' class='do_attr_list attr_list' id='do_tooltip_attrs'></td>\n\
</tr>\n\
</table>");
$.template('mouse_youtube_tooltip', "<table id='${tableID}' class='element_tooltip'>\n\
    <tr>\n\
        <td class='tooltip_visualization' valign='top' rowspan='4' style='padding-left: 10px;'>\n\
            <iframe width='150' height='150' src='http://www.youtube.com/embed/${url}?autoplay=1&controls=0&showinfo=0' frameborder='0' allowfullscreen></iframe>\n\
        </td>\n\
    </tr>\n\
    <tr>\n\
        <td valign='top'>\n\
            <h2 style='padding:0;margin:0'>${info_title}</h2>\n\
        </td>\n\
    </tr>\n\
    <tr>\n\
        <td valign='top'>\n\
            <h3 style='color:#ff6600;padding:0;margin:0;'>${feed}</h3>\n\
        </td>\n\
    </tr>\n\
    <tr>\n\
        <td valign='top'>\n\
            <span style='padding:0;margin:0;font-style:italic;font-weight: bold;'>${date}</span>\n\
        </td>\n\
    </tr>\n\
<tr><td colspan='2'>\n\
<h3 style='width:300px;overflow:hidden;'>${urlstr}</h3>\n\
</td>\n\
</tr>\n\
<tr>\n\
<td colspan='2' style='width:300px;overflow:hidden;' class='do_attr_list attr_list' id='do_tooltip_attrs'></td>\n\
</tr>\n\
</table>");
$.template('mouse_gdrive_tooltip', "<table id='${tableID}' class='doc_tooltip'>\n\
    <tr>\n\
        <td class='tooltip_visualization' valign='top' rowspan='0' style='padding-left: 10px;'>\n\
            <embed style='width:400px; height:326px;' type='application/x-shockwave-flash' src='${url}'></embed>\n\
        </td>\n\
    </tr>\n\
    <tr>\n\
        <td valign='top'>\n\
            <h2 style='padding:0;margin:0'>${info_title}</h2>\n\
        </td>\n\
    </tr>\n\
    <tr>\n\
        <td valign='top'>\n\
            <h3 style='color:#ff6600;padding:0;margin:0;'>${feed}</h3>\n\
        </td>\n\
    </tr>\n\
    <tr>\n\
        <td valign='top'>\n\
            <span style='padding:0;margin:0;font-style:italic;font-weight: bold;'>${date}</span>\n\
        </td>\n\
    </tr>\n\
<tr><td colspan='2'>\n\
<h3 style='width:300px;overflow:hidden;'>${urlstr}</h3>\n\
</td>\n\
</tr>\n\
<tr>\n\
<td colspan='2' style='width:300px;overflow:hidden;' class='do_attr_list attr_list' id='do_tooltip_attrs'></td>\n\
</tr>\n\
</table>");
// HORIZON
$.template('horizon_tmpl',
        "<div id='datepicker'></div>\
	<div id='horizon'>\
		<div id='positioning_hor_el'>\
			<div id='mainLine'></div>\
			<div id='horizon_active'>\
				<div id='horizon_date'></div>\
				<div id='horizon_img'></div>\
				<div id='horizon_title'> </div>\
			</div>\
			<div id='horizon_text'>EVENT HORIZON</div>\
			<div id='horizon_buttons' class='clearfix'>\
				<input type='button' id='horizon_dir' value=' ' title='Change Direction' />\
				<input type='button' id='horizon_calendar' value=' ' title='Choose date from calendar' />\
				<input type='button' id='horizon_menu_button' value=' ' title='Open dates menu' />\
				<input type='button' id='horizon_ontop_button' value=' ' title='X' />\
			</div>\
			<div id='timeline' >\
			<div class='timeline_buttons' class='clearfix'>\n\
				<img id='timeline_start' src='pics/Timeline/button_play.png' />\n\
				<img id='timeline_stop' src='pics/Timeline/button_stop.png' />\n\
				<img id='timeline_next' src='pics/Timeline/button_next.png' />\
			</div>\n\
			<ul id='timeline_progress'></ul>\n\
		</div>\n\
		</div>\
	</div>\
</div>");
$.template('horizon_menu_tmpl', '<tr id="horizon_menu_${id}"><td><img src="${src}" /></td><td><span class="horizon_menu_title">${title}</span></td><td><span class="horizon_menu_date">${date}</span></td></tr>');
$.template('horizon_drop_tmpl', '<div id="horizon_drop"></div>');