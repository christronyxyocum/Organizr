/* TEST SHIT */
// Create language switcher instance
var lang = new Lang();
//lang.dynamic(language(moment.locale(navigator.languages[0])), 'js/langpack/'+language(moment.locale(navigator.languages[0]))+'.json');
lang.dynamic('th', 'js/langpack/th.json');
lang.dynamic('de', 'js/langpack/de.json');
lang.dynamic('nb', 'js/langpack/nb.json');
lang.init({
	defaultLang: 'en',
	currentLang: language(moment.locale(navigator.languages[0])),
	cookie: {
		name: 'organizrLanguage',
		expiry: 365,
		path: '/'
	},
	allowCookieOverride: true
});
// Start Organizr
launch();
/* NORMAL FUNCTIONS */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function timerIncrement() {
    idleTime = idleTime + 1;
    if (idleTime > 19) { // 20 minutes
        //window.location.reload();
    }
	//check for cookieExpiry
	if(hasCookie){
		if(getCookie('organizrToken')){
			//do nothing
		}else{
			location.reload();
		};
	}
}
function ajaxloader(element=null, action='out'){
	var loader = `
	<div class="ajaxloader">
		<svg class="circular" viewBox="25 25 50 50">
			<circle class="path" cx="50" cy="50" fill="none" r="20" stroke-miterlimit="10" stroke-width="5"></circle>
		</svg>
	</div>`;
	switch (action) {
		case 'in':
		case 'fadein':
			$(loader).appendTo(element);
			break;
		case 'out':
		case 'fadeout':
			$('.ajaxloader').remove();
			break;
		default:

	}
}
function getDefault(tabName,tabType){
	if(getHash() === false){
		if(tabName !== null && tabType !== null){
			switchTab(tabName,tabType);
		}else{
			$('#side-menu').children().first().children().click()
		}

	}else{
		var hashTab = getHash();
		var hashType = getTabType(hashTab);
		if (typeof hashTab !== 'undefined' && typeof hashType !== 'undefined') {
			switchTab(hashTab,hashType);
		}else{
			console.warn("Tab Function: "+hashTab+" is not a defined tab");
		}
	}
}
function getTabType(tabName){
	var tabType = $('#menu-'+tabName);
	if (typeof tabType !== 'undefined') {
		return tabType.attr('type');
	}else{
		return false;
	}
}
function getHash(){
	if ($(location).attr('hash')){
		return $(location).attr('hash').substr(1);
	}
	return false;
}
function setHash(hash){
	window.location.hash = '#'+hash;
}
function getQueryVariable(variable){
   var query = window.location.search.substring(1);
   console.log(query);
   var vars = query.split("&");
   console.log(vars);
   for (var i=0;i<vars.length;i++) {
       var pair = vars[i].split("=");
       if(pair[0] == variable){return pair[1];}
   }
   return(false);
}
function iconPrefix(source){
	var tabIcon = source.split("::");
	var icons = {
		"materialize":"mdi mdi-",
		"fontawesome":"fa fa-",
		"themify":"ti-",
		"simpleline":"icon-",
		"weathericon":"wi wi-",
	};
	if(Array.isArray(tabIcon) && tabIcon.length === 2){
		if(tabIcon[0] !== 'url'){
			return '<i class="'+icons[tabIcon[0]]+tabIcon[1]+' fa-fw"></i>';
		}else{
			return '<img class="fa-fw" src="'+tabIcon[1]+'" alt="tabIcon" />';
		}
	}else{
		return '<img class="fa-fw" src="'+source+'" alt="tabIcon" />';
	}
}
function cleanClass(string){
	return string.replace(/ +/g, "-").replace(/\W+/g, "-");
}
function noTabs(arrayItems){
	if (arrayItems.data.user.loggedin === true) {
		organizrConnect('api/?v1/no_tabs').success(function(data) {
			var json = JSON.parse(data);
			console.log("Organizr Function: No Tabs Available");
			$(json.data).appendTo($('.organizr-area'));
		}).fail(function(xhr) {
			console.error("Organizr Function: API Connection Failed");
		});
	}else {
		buildLogin();
	}
}
function logout(){
	message('',' Goodbye!','bottom-right','#FFF','success','10000')
	organizrAPI('GET','api/?v1/logout').success(function(data) {
		var html = JSON.parse(data);
		if(html.data == true){
			location.reload();
		}else{
			$.toast().reset('all');
			message('Logout Error',' An Error Occured','bottom-right','#FFF','warning','10000');
			console.error('Organizr Function: Logout failed');
		}
	}).fail(function(xhr) {
		console.error("Organizr Function: Logout Failed");
	});
}
function reloadOrganizr(){
	location.reload();
}
function hideFrames(){
	$(".iFrame-listing div[class^='frame-container']").addClass("hidden").removeClass('show');
}
function closeSideMenu(){
	$('.fix-header').removeClass('show-sidebar');
}
function removeMenuActive(){
	$("#side-menu a").removeClass('active');
}
function swapDisplay(type){
	switch (type) {
		case 'internal':
			$('.iFrame-listing').addClass('hidden').removeClass('show');
			$('.internal-listing').addClass('show').removeClass('hidden');
			$('.login-area').addClass('hidden').removeClass('show');
			break;
		case 'iframe':
			$('.iFrame-listing').addClass('show').removeClass('hidden');
			$('.internal-listing').addClass('hidden').removeClass('show');
			$('.login-area').addClass('hidden').removeClass('show');
			break;
		case 'login':
			$('.iFrame-listing').addClass('hidden').removeClass('show');
			$('.internal-listing').addClass('hidden').removeClass('show');
			$('.login-area').addClass('show').removeClass('hidden');
			break;
		default:
	}
}
function toggleParentActive(tab){
	var childTab = $('#menu-'+tab);
	if(childTab.parent().hasClass('nav-second-level')){
		if(!childTab.parent().hasClass('in')){
			childTab.parent().addClass('collapse in');
			childTab.parent().parent().addClass('active');
		}
	}
}
function switchTab(tab, type){
	hideFrames();
	closeSideMenu();
	removeMenuActive();
	toggleParentActive(tab);
	switch (type) {
		case 0:
		case '0':
		case 'internal':
			swapDisplay('internal');
			$('#menu-'+cleanClass(tab)).find('a').addClass("active");
			var newTab = $('#internal-'+tab);
			var tabURL = newTab.attr('data-url');
			if(newTab.hasClass('loaded')){
				console.log('Tab Function: Switching to tab: '+tab);
				newTab.addClass("show").removeClass('hidden');
			}else{
				$("#preloader").fadeIn();
				console.log('Tab Function: Loading new tab for: '+tab);
				newTab.addClass("show loaded").removeClass('hidden');
				loadInternal(tabURL,cleanClass(tab));
				$("#preloader").fadeOut();
			}
			break;
		case 1:
		case '1':
		case 'iframe':
			swapDisplay('iframe');
			var newTab = $('#container-'+tab);
			var tabURL = newTab.attr('data-url');
			$('#menu-'+cleanClass(tab)).find('a').addClass("active");
			if(newTab.hasClass('loaded')){
				console.log('Tab Function: Switching to tab: '+tab);
				newTab.addClass("show").removeClass('hidden');
			}else{
				$("#preloader").fadeIn();
				console.log('Tab Function: Loading new tab for: '+tab);
				newTab.addClass("show loaded").removeClass('hidden');
				$(buildFrame(tab,tabURL)).appendTo(newTab);
				$("#preloader").fadeOut();
			}
			break;
		case 2:
		case 3:
		case '2':
		case '3':
		case '_blank':
		case 'popout':
			popTab(cleanClass(tab), type);
			break;
		default:
			console.error('Tab Function: Action not set');
	}
	setHash(tab);
}
function popTab(tab, type){
	switch (type) {
		case 0:
		case '0':
		case 'internal':
			console.warn('Tab Function: New window not supported for tab: '+tab);
			break;
		case 1:
		case '1':
		case 'iframe':
		case 2:
		case 3:
		case '2':
		case '3':
		case '_blank':
		case 'popout':
			console.log('Tab Function: Creating New Window for tab: '+tab);
			var url = $('#container-'+cleanClass(tab)).attr('data-url');
			window.open(url, '_blank');
			break;
		default:
			console.error('Tab Function: Action not set');
	}
}
function closeTab(tab, type){

}
function reloadTab(tab, type){
	$("#preloader").fadeIn();
	console.log('Tab Function: Reloading tab: '+tab);
	switch (type) {
		case 0:
		case '0':
		case 'internal':

			break;
		case 1:
		case '1':
		case 'iframe':
			$('#frame-'+cleanClass(tab)).attr('src', $('#frame-'+cleanClass(tab)).attr('src'));
			break;
		case 2:
		case 3:
		case '2':
		case '3':
		case '_blank':
		case 'popout':

			break;
		default:
			console.error('Tab Function: Action not set');
	}
	$("#preloader").fadeOut();
}
function reloadCurrentTab(){
	$("#preloader").fadeIn();
	console.log('Tab Function: Reloading Current tab');
	var iframe = $('.iFrame-listing').find('.show');
	var internal = $('.internal-listing').find('.show');
	if(iframe.length > 0){
		var type = 'iframe';
	}else if(internal.length > 0){
		var type = 'internal';
	}else{
		var type = 'not set';
	}
	switch (type) {
		case 0:
		case '0':
		case 'internal':
			var activeInternal = $('.internal-listing').find('.show');
			$(activeInternal).html('');
			loadInternal(activeInternal.attr('data-url'),activeInternal.attr('data-name'));
			break;
		case 1:
		case '1':
		case 'iframe':
			var activeFrame = $('.iFrame-listing').find('.show').children('iframe');
			activeFrame.attr('src', activeFrame.attr('src'));
			break;
		case 2:
		case 3:
		case '2':
		case '3':
		case '_blank':
		case 'popout':

			break;
		default:
			console.error('Tab Function: Action not set');
	}
	$("#preloader").fadeOut();
}
function loadNextTab(){
	var next = $('.iFrame-listing').find('.loaded').attr('data-name');
	if (typeof next !== 'undefined') {
		var type = $('.iFrame-listing').find('.loaded').attr('data-type');
		switchTab(next,type);
	}else{
		console.log("Tab Function: No Available Tab to open");
	}
}
function closeCurrentTab(){
	var iframe = $('.iFrame-listing').find('.show');
	var internal = $('.internal-listing').find('.show');
	if(iframe.length > 0){
		var type = 'iframe';
	}else if(internal.length > 0){
		var type = 'internal';
	}else{
		var type = 'not set';
	}
	switch (type) {
		case 0:
		case '0':
		case 'internal':
			var tab = $('.internal-listing').find('.show').attr('data-name');
			console.log('Tab Function: Closing tab: '+tab);
			$('#internal-'+cleanClass(tab)).html('');
			$('#internal-'+cleanClass(tab)).removeClass("loaded show");
			$('#menu-'+cleanClass(tab)).removeClass("active");
			loadNextTab();
			break;
		case 1:
		case '1':
		case 'iframe':
			var tab = $('.iFrame-listing').find('.show').children('iframe').attr('data-name');
			console.log('Tab Function: Closing tab: '+tab);
			$('#menu-'+cleanClass(tab)).removeClass("active");
			$('#container-'+cleanClass(tab)).removeClass("loaded show");
			$('#frame-'+cleanClass(tab)).remove();
			loadNextTab();
			break;
		case 2:
		case 3:
		case '2':
		case '3':
		case '_blank':
		case 'popout':

			break;
		default:
			console.error('Tab Function: Action not set');
	}
}
function message(heading,text,position,color,icon,timeout){
	$.toast({
		heading: heading,
		text: text,
		position: position,
		loaderBg: color,
		icon: icon,
		hideAfter: timeout,
		stack: 6,
		showHideTransition: 'slide',
	});
}
function messageSingle(heading,text,position,color,icon,timeout){
	$.toast({
		heading: heading,
		text: text,
		position: position,
		loaderBg: color,
		icon: icon,
		hideAfter: timeout,
		stack: 1,
		showHideTransition: 'slide',
	});
}
function tabActions(event,name, type){
	if(event.ctrlKey){
		popTab(cleanClass(name), type);
	}else if(event.altKey){
		console.log('alt key');
	}else if(event.shiftKey){
		reloadTab(cleanClass(name), type);
	}else{
		switchTab(cleanClass(name), type);
	}
}
function reverseObject(object) {
    var newObject = {};
    var keys = [];
    for (var key in object) {
        keys.push(key);
    }
    for (var i = keys.length - 1; i >= 0; i--) {
      var value = object[keys[i]];
      newObject[keys[i]]= value;
    }
    return newObject;
}
function hasValue(test){
	if(Array.isArray(test) && test[0] !== ''){
		return true;
	}else{
		return false;
	}
	return false;
}
/* END NORMAL FUNCTIONS */
/* BUILD FUNCTIONS */
/* END BUILD FUNCTIONS */
/* ORGANIZR API FUNCTIONS */
function buildFormItem(item){
	var placeholder = (item.placeholder) ? ' placeholder="'+item.placeholder+'"' : '';
	var id = (item.id) ? ' id="'+item.placeholder+'"' : '';
	var value = (item.value) ? ' value="'+item.value+'"' : '';
	var name = (item.name) ? ' name="'+item.name+'"' : '';
	var extraClass = (item.class) ? ' '+item.class : '';
	//+tof(item.value,'c')+`
	switch (item.type) {
		case 'input':
			return '<input data-changed="false" lang=en" type="text" class="form-control'+extraClass+'"'+placeholder+value+id+name+' />';
			break;
		case 'switch':
		case 'checkbox':
			return '<input data-changed="false" type="checkbox" class="js-switch'+extraClass+'" data-size="small" data-color="#99d683" data-secondary-color="#f96262"'+name+value+tof(item.value,'c')+' /><input data-changed="false" type="hidden"'+name+'value="false">';
			break;
		default:
			return false;
	}
}
function buildCustomizeAppearanceItem(array){
	/*
	<!-- FORM GROUP -->
	<h3 class="box-title">Person Info</h3>
	<hr class="m-t-0 m-b-40">
	<div class="row">

		<!-- INPUT BOX -->
		<div class="col-md-6">
			<div class="form-group">
				<label class="control-label col-md-3" lang="en">First Name</label>
				<div class="col-md-9">
					<input type="text" class="form-control" placeholder="John doe"></div>
			</div>
		</div>
		<!--/ INPUT BOX -->

	</div>
	<!--/ FORM GROUP -->
	*/
	if (Array.isArray(array.config)) {
		var preRowConfig = `
			<!-- FORM GROUP -->
			<h3 class="box-title" lang="en">Config Items</h3>
			<hr class="m-t-0 m-b-40">
			<div class="row">
		`;
		var customizeItems = preRowConfig;
		$.each(array.config, function(i,v) {
			customizeItems += `
				<!-- INPUT BOX -->
				<div class="col-md-6">
					<div class="form-group">
						<label class="control-label col-md-3" lang="en">`+v.label+`</label>
						<div class="col-md-9">
							`+buildFormItem(v)+`
						</div>
					</div>
				</div>
				<!--/ INPUT BOX -->
			`;
		});
		customizeItems += '</div>';
	}

	return customizeItems;
}
function buildCustomizeAppearance(){
	ajaxloader(".content-wrap","in");
	organizrAPI('GET','api/?v1/customize/appearance').success(function(data) {
		var response = JSON.parse(data);
		$('#customize-appearance-form').html(buildCustomizeAppearanceItem(response.data));
		;
	}).fail(function(xhr) {
		console.error("Organizr Function: API Connection Failed");
	});
	ajaxloader();
}
function buildUserManagement(){
	ajaxloader(".content-wrap","in");
	organizrAPI('GET','api/?v1/user/list').success(function(data) {
		var response = JSON.parse(data);
		$('#manageUserTable').html(buildUserManagementItem(response.data));
	}).fail(function(xhr) {
		console.error("Organizr Function: API Connection Failed");
	});
	ajaxloader();
}
function buildGroupManagement(){
	ajaxloader(".content-wrap","in");
	organizrAPI('GET','api/?v1/user/list').success(function(data) {
		var response = JSON.parse(data);
		$('#manageGroupTable').html(buildGroupManagementItem(response.data));
	}).fail(function(xhr) {
		console.error("Organizr Function: API Connection Failed");
	});
	ajaxloader();
}
function buildTabEditor(){
	ajaxloader(".content-wrap","in");
	organizrAPI('GET','api/?v1/tab/list').success(function(data) {
		var response = JSON.parse(data);
		$('#tabEditorTable').html(buildTabEditorItem(response.data));
	}).fail(function(xhr) {
		console.error("Organizr Function: API Connection Failed");
	});
	ajaxloader();
}
function buildCategoryEditor(){
	ajaxloader(".content-wrap","in");
	organizrAPI('GET','api/?v1/tab/list').success(function(data) {
		var response = JSON.parse(data);
		$('#categoryEditorTable').html(buildCategoryEditorItem(response.data));
	}).fail(function(xhr) {
		console.error("Organizr Function: API Connection Failed");
	});
	ajaxloader();
}
function settingsAPI(post, callbacks=null){
	ajaxloader(".content-wrap","in");
	organizrAPI('POST',post.api,post).success(function(data) {
		var response = JSON.parse(data);
		console.log(response);
		message(post.messageTitle,post.messageBody,"bottom-right","#FFF","success","5000");
		if(callbacks){ callbacks.fire(); console.log('fired'); }
	}).fail(function(xhr) {
		console.error(post.error);
	});
	ajaxloader();
}
/* END ORGANIZR API FUNCTIONS */
function buildLanguage(replace=false,newLang=null){
	var languages = {
		'en':{
			'lang':'English',
			'image':'plugins/images/languages/en.png'
		},
		'de':{
			'lang':'Deutsch',
			'image':'plugins/images/languages/de.png'
		},
		'nb':{
			'lang':'Bokmål',
			'image':'plugins/images/languages/nb.png'
		}
	};
	var languageItems = '';
	var currentLanguage = (getCookie('organizrLanguage')) ? getCookie('organizrLanguage') : window.lang.currentLang;
	$.each(languages, function(i,v) {
		var active = (i == currentLanguage) ? '' : '';
		languageItems += `
			<a onclick="window.lang.change('`+i+`');buildLanguage(true,'`+v.lang+`')" href="javascript:void(0);" class="`+active+`">
				<div class="mail-contnet"><h5>`+v.lang+`</h5><span class="mail-desc" lang="en">`+active+`</span></div>
			</a>
		`;
	});
	var lang = `
		<li class="dropdown" id="languageDropdown">
			<a class="dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#" aria-expanded="false"> <i class="fa fa-language"></i><span></span></a>
			<ul class="dropdown-menu mailbox animated bounceInDown">
				<li>
					<div class="drop-title" lang="en">Choose Language</div>
				</li>
				<li>
					<div class="message-center">`+languageItems+`</div>
				</li>
			</ul>
			<!-- /.dropdown-messages -->
		</li>
	`;
	if(replace == true){
		$('#languageDropdown').replaceWith(lang);
		message("",window.lang.translate('Changed Language To')+": "+newLang,"bottom-right","#FFF","success","3500");
	}else if(replace == 'wizard'){
		$(lang).appendTo('.navbar-right');
	}else{
		return lang;
	}
}
function userMenu(user){
	var menuList = buildLanguage();
	if (user.data.user.loggedin === true) {
		menuList += `
			<li class="dropdown">
				<a class="dropdown-toggle profile-pic" data-toggle="dropdown" href="javascript:void(0)"><img alt="user-img" class="img-circle" src="`+user.data.user.image+`" width="36"><b class="hidden-xs">`+user.data.user.username+`</b><span class="caret"></span></a>
				<ul class="dropdown-menu dropdown-user animated flipInY">
					<li>
						<div class="dw-user-box">
							<div class="u-img"><img alt="user" src="`+user.data.user.image+`"></div>
							<div class="u-text"><h4>`+user.data.user.username+`</h4><p class="text-muted">`+user.data.user.email+`</p><p class="text-muted">`+user.data.user.group+`</p></div>
						</div>
					</li>
					<li class="divider" role="separator"></li>
					<li><a href="javascript:void(0)"><i class="ti-user fa-fw"></i> <span lang="en">My Profile</span></a></li>
					<li><a href="javascript:void(0)"><i class="ti-email fa-fw"></i> <span lang="en">Inbox</span></a></li>
					<li class="divider" role="separator"></li>
					<li><a href="javascript:void(0)"><i class="ti-settings fa-fw"></i> <span lang="en">Account Settings</span></a></li>
					<li class="divider" role="separator"></li>
					<li><a href="javascript:void(0)" onclick="logout();"><i class="fa fa-sign-out fa-fw"></i> <span lang="en">Logout</span></a></li>
				</ul><!-- /.dropdown-user -->
			</li><!-- /.dropdown -->
		`;
	}else{
		menuList += `
			<li class="dropdown">
					<a class="dropdown-toggle profile-pic" data-toggle="dropdown" href="javascript:void(0)"><img alt="user-img" class="img-circle" src="`+user.data.user.image+`" width="36"><b class="hidden-xs">`+user.data.user.username+`</b><span class="caret"></span></a>
					<ul class="dropdown-menu dropdown-user animated flipInY">
						<li>
							<div class="dw-user-box">
								<div class="u-img"><img alt="user" src="`+user.data.user.image+`"></div>
								<div class="u-text"><h4>`+user.data.user.username+`</h4></div>
							</div>
						</li>
						<li class="divider" role="separator"></li>
						<li><a href="javascript:void(0)" class="show-login"><i class="fa fa-sign-in fa-fw"></i> <span lang="en">Login/Register</span></a></li>
					</ul><!-- /.dropdown-user -->
				</li><!-- /.dropdown -->
		`;
	}
	$(menuList).appendTo('.navbar-right').html;
	message("",window.lang.translate('Welcome')+" "+user.data.user.username,"bottom-right","#FFF","success","3500");
	console.log(window.lang.translate('Welcome')+" "+user.data.user.username);
}
function menuExtras(active){
	if(active === true){
		return `
			<li class="devider"></li>
			<li><a class="waves-effect" onclick="logout();"><i class="fa fa-sign-out fa-fw"></i> <span class="hide-menu" lang="en">Logout</span></a></li>
			<li class="devider"></li>
			<li><a href="https://github.com/causefx/organizr" class="waves-effect"><i class="fa fa-circle-o fa-fw text-success"></i> <span class="hide-menu">GitHub</span></a></li>
		`;
	}else{
		return `
			<li class="devider"></li>
			<li id="menu-login"><a class="waves-effect show-login" href="javascript:void(0)"><i class="mdi mdi-login fa-fw"></i> <span class="hide-menu" lang="en">Login/Register</span></a></li>
		`;
	}
}
function categoryProcess(arrayItems){
	var menuList = '';
	if (Array.isArray(arrayItems['data']['categories']) && Array.isArray(arrayItems['data']['tabs'])) {
		$.each(arrayItems['data']['categories'], function(i,v) {
			if(v.count !== 0 && v.category_id !== 0){
				menuList += `
					<li>
						<a class="waves-effect" href="javascript:void(0)">`+iconPrefix(v.image)+`<span class="hide-menu">`+v.category+` <span class="fa arrow"></span> <span class="label label-rouded label-inverse pull-right">`+v.count+`</span></span></a>
						<ul class="nav nav-second-level category-`+v.category_id+` collapse"></ul>
					</li>
				`;
			}
		});
		$(menuList).appendTo($('#side-menu'));
	}
}
function buildFrame(name,url){
	return `
		<iframe allowfullscreen="true" frameborder="0" id="frame-`+cleanClass(name)+`" data-name="`+cleanClass(name)+`" sandbox="allow-presentation allow-forms allow-same-origin allow-pointer-lock allow-scripts allow-popups allow-modals allow-top-navigation" scrolling="auto" src="`+url+`" class="iframe"></iframe>
	`;
}
function buildFrameContainer(name,url,type){
	return `<div id="container-`+cleanClass(name)+`" data-type="`+type+`" class="frame-container frame-`+cleanClass(name)+` hidden" data-url="`+url+`" data-name="`+cleanClass(name)+`"></div>`;
}
function buildInternalContainer(name,url,type){
	return `<div id="internal-`+cleanClass(name)+`" data-type="`+type+`" class="internal-container frame-`+cleanClass(name)+` hidden" data-url="`+url+`" data-name="`+cleanClass(name)+`"></div>`;
}
function buildMenuList(name,url,type,icon){
	return `<li id="menu-`+cleanClass(name)+`" type="`+type+`"><a class="waves-effect" onclick="tabActions(event,'`+cleanClass(name)+`',`+type+`);">`+iconPrefix(icon)+`<span class="hide-menu">`+name+`</span></a></li>`;
}
function tabProcess(arrayItems) {
	var iFrameList = '';
	var internalList = '';
	var defaultTabName = null;
	var defaultTabType = null;
	if (Array.isArray(arrayItems['data']['tabs']) && arrayItems['data']['tabs'].length > 0) {
		$.each(arrayItems['data']['tabs'], function(i,v) {
			if(v.enabled === 1){
				switch (v.type) {
					case 0:
					case '0':
					case 'internal':
						internalList += buildInternalContainer(v.name,v.url,v.type);
						$(internalList).appendTo($('.internal-listing'));
						break;
					case 1:
					case '1':
					case 'iframe':
						if(v.default === 1){
							defaultTabName = cleanClass(v.name);
							defaultTabType = v.type;
						}
						iFrameList = buildFrameContainer(v.name,v.url,v.type);
						$(iFrameList).appendTo($('.iFrame-listing'));
						break;
					case 2:
					case 3:
					case '2':
					case '3':
					case '_blank':
					case 'popout':
						break;
					default:
						console.error('Tab Process: Action not set');
				}
				menuList = buildMenuList(v.name,v.url,v.type,v.image);
				if(v.category_id === 0){
					$(menuList).prependTo($('#side-menu'));
				}else{
					$(menuList).prependTo($('.category-'+v.category_id));
				}
			}
		});
		getDefault(defaultTabName,defaultTabType);
	}else{
		noTabs(arrayItems);
	}
	$(menuExtras(arrayItems.data.user.loggedin)).appendTo($('#side-menu'));
}
function buildLogin(){
	swapDisplay('login');
	closeSideMenu();
	removeMenuActive();
	$('#menu-login a').addClass('active');
	organizrConnect('api/?v1/login_page').success(function(data) {
		var json = JSON.parse(data);
		console.log("Organizr Function: Opening Login Page");
		$('.login-area').html(json.data);
	}).fail(function(xhr) {
		console.error("Organizr Function: Login Connection Failed");
	});
}
function buildLockscreen(){
	closeSideMenu();
	organizrConnect('api/?v1/lockscreen').success(function(data) {
		var json = JSON.parse(data);
		console.log("Organizr Function: Adding Lockscreen");
		$(json.data).appendTo($('body'));
	}).fail(function(xhr) {
		console.error("Organizr Function: Lockscreen Connection Failed");
	});
}
function buildUserGroupSelect(array, userID, groupID){
	var groupSelect = '';
	var selected = '';
	var disabled = '';
	if(groupID == 0  && userID == 1){
		disabled = 'disabled';
	}
	$.each(array, function(i,v) {
		selected = '';
		if(v.group_id == groupID){
			selected = 'selected';
		}
		var selectDisable = (v.group_id == 0 || v.group_id == 999) ? 'disabled' : '';
		groupSelect += '<option '+selected+' '+selectDisable+' value="'+v.group_id+'">'+v.group+'</option>';
	});
	return '<td><select name="userGroupSelect" class="form-control userGroupSelect" '+disabled+'>'+groupSelect+'</select></td>';
}
function buildTabGroupSelect(array, tabID, groupID){
	var groupSelect = '';
	var selected = '';
	$.each(array, function(i,v) {
		selected = '';
		if(v.group_id == groupID){
			selected = 'selected';
		}
		groupSelect += '<option '+selected+' value="'+v.group_id+'">'+v.group+'</option>';
	});
	return '<td><select name="tab['+tabID+'].group_id" class="form-control tabGroupSelect">'+groupSelect+'</select></td>';
}
function buildTabTypeSelect(tabID, typeID){
	var array = [
		{
			'type_id':0,
			'type':'Internal'
		},
		{
			'type_id':1,
			'type':'iFrame'
		},
		{
			'type_id':2,
			'type':'New Window'
		}
	]
	var typeSelect = '';
	var selected = '';
	$.each(array, function(i,v) {
		selected = '';
		if(v.type_id == typeID){
			selected = 'selected';
		}
		typeSelect += '<option '+selected+' value="'+v.type_id+'">'+v.type+'</option>';
	});
	return '<td><select name="tab['+tabID+'].type" class="form-control tabTypeSelect">'+typeSelect+'</select></td>';
}
function buildTabCategorySelect(array,tabID, categoryID){
	var categorySelect = '';
	var selected = '';
	$.each(array, function(i,v) {
		selected = '';
		if(v.category_id == categoryID){
			selected = 'selected';
		}
		categorySelect += '<option '+selected+' value="'+v.category_id+'">'+v.category+'</option>';
	});
	return '<td><select name="tab['+tabID+'].category_id" class="form-control tabCategorySelect">'+categorySelect+'</select></td>';
}
function buildUserManagementItem(array){
	var userList = '';
	$.each(array.users, function(i,v) {
		var disabledDelete = (v.group_id == 999 || v.group_id == 0) ? 'disabled' : 'deleteUser';
		userList += `
		<tr class="userManagement" data-id="`+v.id+`" data-username="`+v.username+`" data-group="`+v.group+`">
			<td class="text-center el-element-overlay">
				<div class="el-card-item p-0">
					<div class="el-card-avatar el-overlay-1 m-0">
						<img alt="user-img" class="img-circle" src="`+v.image+`" width="45">
						<div class="el-overlay">
							<ul class="el-info">
								`+v.id+`
							</ul>
						</div>
					</div>
				</div>
			</td>
			<td>`+v.username+`
				<br/><span class="text-muted">`+v.email+`</span></td>
			<td>`+moment(v.register_date).format('ll')+`
				<br/><span class="text-muted">`+moment(v.register_date).format('LT')+`</span></td>
			`+buildUserGroupSelect(array.groups,v.id,v.group_id)+`
			<td><button type="button" class="btn btn-info btn-outline btn-circle btn-lg m-r-5 editUser"><i class="ti-pencil-alt"></i></button></td>
			<td><button type="button" class="btn btn-info btn-outline btn-circle btn-lg m-r-20"><i class="ti-email"></i></button></td>
			<td><button type="button" class="btn btn-danger btn-outline btn-circle btn-lg m-r-5 `+disabledDelete+`"><i class="ti-trash"></i></button></td>
		</tr>
		`;
	});
	return userList;
}
function buildGroupManagementItem(array){
	var userList = '';
	$.each(array.groups, function(i,v) {
		var userCount = array.users.reduce(function (n, group) {
		    return n + (group.group_id == v.group_id);
		}, 0);
		var disabledDefault = (v.group_id == 0 || v.group_id == 999) ? 'disabled' : '';
		var disabledDelete = (userCount > 0 || v.default == 1 || v.group_id == 999 || v.group_id == 0) ? 'disabled' : '';
		var defaultIcon = (v.default == 1) ? 'icon-user-following' : 'icon-user-follow';
		var defaultColor = (v.default == 1) ? 'btn-info disabled' : 'btn-warning';
		userList += `
		<tr class="userManagement" data-id="`+v.id+`" data-group-id="`+v.group_id+`" data-group="`+v.group+`" data-default="`+tof(v.default)+`" data-image="`+v.image+`" data-user-count="`+userCount+`">
			<td class="text-center el-element-overlay">
				<div class="el-card-item p-0">
					<div class="el-card-avatar el-overlay-1 m-0">
						<div class="tabEditorIcon">`+iconPrefix(v.image)+`</div>
						<div class="el-overlay">
							<ul class="el-info">
								`+v.group_id+`
							</ul>
						</div>
					</div>
				</div>
			</td>
			<td>`+v.group+`</td>
			<td>`+userCount+`</td>
			<td><button type="button" class="btn `+defaultColor+` btn-outline btn-circle btn-lg m-r-5 changeDefaultGroup" `+disabledDefault+`><i class="`+defaultIcon+`"></i></button></td>
			<td><button type="button" class="btn btn-info btn-outline btn-circle btn-lg m-r-5 editGroupButton popup-with-form" href="#edit-group-form" data-effect="mfp-3d-unfold"><i class="ti-pencil-alt"></i></button></td>
			<td><button type="button" class="btn btn-danger btn-outline btn-circle btn-lg m-r-5 deleteUserGroup" `+disabledDelete+`><i class="ti-trash"></i></button></td>
		</tr>
		`;
	});
	return userList;
}
function buildCategoryEditorItem(array){
	var categoryList = '';
	$.each(array.categories, function(i,v) {
		var tabCount = array.tabs.reduce(function (n, category) {
		    return n + (category.category_id == v.category_id);
		}, 0);
		var disabledDefault = (v.category_id == 0) ? 'disabled' : '';
		var disabledDelete = (tabCount > 0 || v.default == 1 || v.category_id == 0) ? 'disabled' : '';
		var defaultIcon = (v.default == 1) ? 'icon-user-following' : 'icon-user-follow';
		var defaultColor = (v.default == 1) ? 'btn-info disabled' : 'btn-warning';
		categoryList += `
		<tr class="categoryEditor" data-id="`+v.id+`" data-order="`+v.order+`" data-category-id="`+v.category_id+`" data-name="`+v.category+`" data-default="`+tof(v.default)+`" data-image="`+v.image+`" data-tab-count="`+tabCount+`">
			<input type="hidden" class="form-control order" name="category[`+v.id+`].order" value="`+v.order+`">
			<input type="hidden" class="form-control" name="category[`+v.id+`].originalOrder" value="`+v.order+`">
			<input type="hidden" class="form-control" name="category[`+v.id+`].name" value="`+v.category+`">
			<input type="hidden" class="form-control" name="category[`+v.id+`].id" value="`+v.id+`">
			<td class="text-center el-element-overlay">
				<div class="el-card-item p-0">
					<div class="el-card-avatar el-overlay-1 m-0">
						<div class="tabEditorIcon">`+iconPrefix(v.image)+`</div>
						<div class="el-overlay bg-theme-dark">
							<ul class="el-info">
								<i class="fa fa-bars"></i>
							</ul>
						</div>
					</div>
				</div>
			</td>
			<td>`+v.category+`</td>
			<td style="text-align:center">`+tabCount+`</td>
			<td style="text-align:center"><button type="button" class="btn `+defaultColor+` btn-outline btn-circle btn-lg m-r-5 changeDefaultCategory" `+disabledDefault+`><i class="`+defaultIcon+`"></i></button></td>
			<td style="text-align:center"><button type="button" class="btn btn-info btn-outline btn-circle btn-lg m-r-5 editCategoryButton popup-with-form" href="#edit-category-form" data-effect="mfp-3d-unfold"><i class="ti-pencil-alt"></i></button></td>
			<td style="text-align:center"><button type="button" class="btn btn-danger btn-outline btn-circle btn-lg m-r-5 deleteCategory" `+disabledDelete+`><i class="ti-trash"></i></button></td>
		</tr>
		`;
	});
	return categoryList;
}
function buildTabEditorItem(array){
	var tabList = '';
	$.each(array.tabs, function(i,v) {
		var deleteDisabled = v.url.indexOf('/?v') > 0 ? 'disabled' : 'deleteTab';
		tabList += `
		<tr class="tabEditor" data-order="`+v.order+`" data-id="`+v.id+`" data-group-id="`+v.group_id+`" data-category-id="`+v.category_id+`" data-name="`+v.name+`" data-url="`+v.url+`" data-image="`+v.image+`">
			<input type="hidden" class="form-control" name="tab[`+v.id+`].id" value="`+v.id+`">
			<input type="hidden" class="form-control order" name="tab[`+v.id+`].order" value="`+v.order+`">
			<input type="hidden" class="form-control" name="tab[`+v.id+`].originalOrder" value="`+v.order+`">
			<input type="hidden" class="form-control" name="tab[`+v.id+`].url_local" value="`+v.url_local+`">
			<input type="hidden" class="form-control" name="tab[`+v.id+`].name" value="`+v.name+`">
			<input type="hidden" class="form-control" name="tab[`+v.id+`].url" value="`+v.url+`">
			<input type="hidden" class="form-control" name="tab[`+v.id+`].image" value="`+v.image+`">
			<td style="text-align:center" class="text-center el-element-overlay">
				<div class="el-card-item p-0">
					<div class="el-card-avatar el-overlay-1 m-0">
						<div class="tabEditorIcon">`+iconPrefix(v.image)+`</div>
						<div class="el-overlay bg-theme-dark">
							<ul class="el-info">
								<i class="fa fa-bars"></i>
							</ul>
						</div>
					</div>
				</div>
			</td>
			<td>`+v.name+`</td>
			`+buildTabCategorySelect(array.categories,v.id, v.category_id)+`
			`+buildTabGroupSelect(array.groups,v.id, v.group_id)+`
			`+buildTabTypeSelect(v.id, v.type)+`
			<td style="text-align:center"><div class="radio radio-purple"><input onclick="radioLoop(this);" type="radio" class="defaultSwitch" id="tab[`+v.id+`].default" name="tab[`+v.id+`].default" value="true" `+tof(v.default,'c')+`><label for="tab[`+v.id+`].default"></label></div></td>

			<td style="text-align:center"><input type="checkbox" class="js-switch enabledSwitch" data-size="small" data-color="#99d683" data-secondary-color="#f96262" name="tab[`+v.id+`].enabled" value="true" `+tof(v.enabled,'c')+`/><input type="hidden" class="form-control" name="tab[`+v.id+`].enabled" value="false"></td>
			<td style="text-align:center"><input type="checkbox" class="js-switch splashSwitch" data-size="small" data-color="#99d683" data-secondary-color="#f96262" name="tab[`+v.id+`].splash" value="true" `+tof(v.splash,'c')+`/><input type="hidden" class="form-control" name="tab[`+v.id+`].splash" value="false"></td>
			<td style="text-align:center"><button type="button" class="btn btn-info btn-outline btn-circle btn-lg m-r-5 editTabButton popup-with-form" href="#edit-tab-form" data-effect="mfp-3d-unfold"><i class="ti-pencil-alt"></i></button></td>
			<td style="text-align:center"><button type="button" class="btn btn-danger btn-outline btn-circle btn-lg m-r-5 `+deleteDisabled+`"><i class="ti-trash"></i></button></td>
		</tr>
		`;
	});
	return tabList;
}
function submitTabOrder(){
	var post = {
		action:'changeOrder',
		api:'api/?v1/settings/tab/editor/tabs',
		tabs:$( "#submit-tabs-form" ).serializeToJSON(),
		messageTitle:'',
		messageBody:window.lang.translate('Tab Order Saved'),
		error:'Organizr Function: API Connection Failed'
	};
	settingsAPI(post);
	buildTabEditor();
}
function submitCategoryOrder(){
	var post = {
		action:'changeOrder',
		api:'api/?v1/settings/tab/editor/categories',
		categories:$( "#submit-categories-form" ).serializeToJSON(),
		messageTitle:'',
		messageBody:window.lang.translate('Category Order Saved'),
		error:'Organizr Function: API Connection Failed'
	};
	console.log(post);
	settingsAPI(post);
	buildCategoryEditor();
}
function buildTR(array,type,badge){
	var listing = '';
	var arrayItems = array.split("|");
	if(hasValue(arrayItems) === true){
		$.each(arrayItems, function(i,v) {
			listing += `
			<tr>
				<td  width="70"><span class="label label-`+badge+`"><span lang="en">`+type+`</span></span></td>
				<td>`+v+`</td>
			</tr>
			`;
		});
		return listing;
	}
	return ' ';
}
function buildVersion(array){
	var x = 0;
	var versions = '<h3 class="p-l-10 m-b-0 box-title" lang="en">Organizr Versions</h3>';
	var listing = '';
	var currentV = currentVersion;
	var installed = '';
	var spanClass = '';
	var button = '';
	$.each(array, function(i,v) {
		listing += buildTR(v.new,'NEW','info');
		listing += buildTR(v.fixed,'FIXED','success');
		listing += buildTR(v.notes,'NOTE','warning');
		if(currentV === i){
			button = '<button class="btn btn-sm btn-success btn-rounded waves-effect waves-light disabled pull-right row b-none" type="button"><span class="btn-label"><i class="fa fa-check"></i></span><span lang="en">Installed</span></button>';
		}else if (x === 0){
			button = '<button class="btn btn-sm btn-info btn-rounded waves-effect waves-light pull-right row b-none" type="button" onclick="updateNow();"><span class="btn-label"><i class="fa fa-download"></i></span><span lang="en">Install Update</span></button>';
		}
		versions += `
		<div class="white-box bg-theme-dark">
			<div class="col-md-3 col-sm-4 col-xs-6 pull-right">`+button+`</div>
			<h3 class="box-title">`+i+`</h3>
			<div class="row sales-report">
				<div class="col-md-12 col-sm-12 col-xs-12">

						<span class="tooltip-info" data-toggle="tooltip" data-placement="right" title="" data-original-title="`+moment(v.date).format('LL')+`">`+moment(v.date, "YYYYMMDD").fromNow()+`</span>

					<p class="text-info p-0">`+v.title+`</p>
				</div>
			</div>
			<div class="table-responsive">
				<table class="table inverse-bordered-table">
					<tbody>
						`+listing+`
					</tbody>
				</table>
			</div>
		</div>
		`;
		listing = '';
		button = '';
		x++;
	});
	return versions;
}
function loadInternal(url,tabName){
	organizrAPI('get',url).success(function(data) {
		var html = JSON.parse(data);
		$('#internal-'+tabName).html(html.data);
	}).fail(function(xhr) {
		console.error("Organizr Function: Connection Failed");
	});
}
function loadSettingsPage(api,element,organizrFn){
	organizrAPI('get',api).success(function(data) {
		var json = JSON.parse(data);
		console.log('Organizr Function: Loading '+organizrFn);
		$(element).html(json.data);
	}).fail(function(xhr) {
		console.error("Organizr Function: API Connection Failed");
	});
}
function updateCheck(){
	githubVersions().success(function(data) {
		var json = JSON.parse(data);
		for (var a in reverseObject(json)){
			var latest = a;
			break;
		}
		if(latest !== currentVersion){
			console.log('Update Function: Update to '+latest+' is available');
			message(window.lang.translate('Update Available'),latest+' '+window.lang.translate('is available, goto')+' <a href="javascript:void(0)" onclick="tabActions(event,\'Settings\',0);$.toast().reset(\'all\');"><span lang="en">Update Tab</span></a>','bottom-right','#FFF','update','60000');
		}else{
			console.log('Update Function: '+latest+' is the newest version');
		}
		$('#githubVersions').html(buildVersion(reverseObject(json)));
	}).fail(function(xhr) {
		console.error("Organizr Function: Github Connection Failed");
	});
}
function updateBar(){
	return `
	<div class="white-box m-0">
        <div class="row">
            <div class="col-lg-12 p-r-40">
                <h3 lang="en" id="update-title" class="box-title pull-left"></h3><h3 id="update-time" class="box-title pull-right hidden"><span id="update-seconds"></span>&nbsp;<span lang="en">Seconds</span></h3>
				<div class="clearfix"></div>
                <div class="progress progress-lg">
                    <div id="update-bar" class="progress-bar progress-bar-primary progress-bar-striped active" style="width: 0%;" role="progressbar">0%</div>
                </div>
            </div>
        </div>
    </div>
	`;
}
function updateUpdateBar(title,percent,update=false){
	$('#update-title').text(title);
	$('#update-bar').text(percent);
	$('#update-bar').css('width',percent);
	if(update){
		$('#update-time').removeClass('hidden');
		countdown(10);
	}
}
function countdown(remaining) {
    if(remaining === 0){
		local('set','message','Organizr Update|Update Successful|update');
        location.reload();
	}
	$('#update-seconds').text(remaining);
    setTimeout(function(){ countdown(remaining - 1); }, 1000);
}
function updateNow(){
	console.log('Organizr Function: Starting Update Process');
	$(updateBar()).appendTo('.organizr-area');
	updateUpdateBar('Starting Download','5%');
	messageSingle(window.lang.translate('[DO NOT CLOSE WINDOW]'),window.lang.translate('Starting Update Process'),'bottom-right','#FFF','success','60000');
	organizrAPI('POST','api/?v1/update', {branch:activeInfo.branch,stage:1}).success(function(data) {
		var json = JSON.parse(data);
		if(json.data == true){
			updateUpdateBar('Starting Unzip','50%');
			messageSingle(window.lang.translate('[DO NOT CLOSE WINDOW]'),window.lang.translate('Update File Downloaded'),'bottom-right','#FFF','success','60000');
			organizrAPI('POST','api/?v1/update', {branch:activeInfo.branch,stage:2}).success(function(data) {
				var json = JSON.parse(data);
				if(json.data == true){
					updateUpdateBar('Starting Copy','70%');
					messageSingle(window.lang.translate('[DO NOT CLOSE WINDOW]'),window.lang.translate('Update File Unzipped'),'bottom-right','#FFF','success','60000');
					organizrAPI('POST','api/?v1/update', {branch:activeInfo.branch,stage:3}).success(function(data) {
						var json = JSON.parse(data);
						if(json.data == true){
							updateUpdateBar('Starting Cleanup','90%');
							messageSingle(window.lang.translate('[DO NOT CLOSE WINDOW]'),window.lang.translate('Update Files Copied'),'bottom-right','#FFF','success','60000');
							organizrAPI('POST','api/?v1/update', {branch:activeInfo.branch,stage:4}).success(function(data) {
								var json = JSON.parse(data);
								if(json.data == true){
									updateUpdateBar('Restarting Organizr in','100%', true);
									messageSingle(window.lang.translate('[DO NOT CLOSE WINDOW]'),window.lang.translate('Update Cleanup Finished'),'bottom-right','#FFF','success','60000');
									setTimeout(location.reload.bind(location), 10000);
								}else{
									message('',window.lang.translate('Update Cleanup Failed'),'bottom-right','#FFF','error','10000');
								}
							}).fail(function(xhr) {
								console.error("Organizr Function: API Connection Failed");
							});
						}else{
							message('',window.lang.translate('Update File Copy Failed'),'bottom-right','#FFF','error','10000');
						}
					}).fail(function(xhr) {
						console.error("Organizr Function: API Connection Failed");
					});
				}else{
					message('',window.lang.translate('Update File Unzip Failed'),'bottom-right','#FFF','error','10000');
				}
			}).fail(function(xhr) {
				console.error("Organizr Function: API Connection Failed");
			});
		}else{
			message('',window.lang.translate('Update File Download Failed'),'bottom-right','#FFF','error','10000');
		}
	}).fail(function(xhr) {
		console.error("Organizr Function: API Connection Failed");
	});
}
function organizrAPI(type,path,data=null){
	//console.log('Organizr API: Calling API: '+path);
	switch (type) {
		case 'get':
		case 'GET':
		case 'g':
			return $.ajax({
				url:path,
				method:"GET",
				beforeSend: function(request) {
					request.setRequestHeader("Token", activeInfo.token);
				},
			});
			break;
		case 'post':
		case 'POST':
		case 'p':
			return $.ajax({
				url:path,
				method:"POST",
				beforeSend: function(request) {
					request.setRequestHeader("Token", activeInfo.token);
				},
				data:{
					data: data,
				}
			});
		default:
		console.warn('Organizr API: Method Not Supported');
	}
}
function githubVersions() {
	return $.ajax({
		url: "https://raw.githubusercontent.com/causefx/Organizr/"+activeInfo.branch+"/js/version.json",
	});
}
function organizrConnect(path){
	return $.ajax({
		url: path,
	});
}
function changeSettingsMenu(path){
	var menuItems = path.split("::");
	var menu = '';
	if(Array.isArray(menuItems)){
		$.each(menuItems, function(i,v) {
			menu += '<li><a lang="en">'+v+'</a></li>';
		});
	}
	$('#settingsBreadcrumb').html(menu);
}
function buildWizard(){
	organizrConnect('api/?v1/wizard_page').success(function(data) {
		var json = JSON.parse(data);
		console.log("Organizr Function: Starting Install Wizard");
		$(json.data).appendTo($('.organizr-area'));
	}).fail(function(xhr) {
		console.error("Organizr Function: Wizard Connection Failed");
	});
}
function buildDependencyCheck(orgdata){
	organizrConnect('api/?v1/dependencies_page').success(function(data) {
		var json = JSON.parse(data);
		console.log("Organizr Function: Starting Dependencies Check");
		$(json.data).appendTo($('.organizr-area'));
		$(buildBrowserInfo()).appendTo($('#browser-info'));
		$('#web-folder').html(buildWebFolder(orgdata));
		$(buildDependencyInfo(orgdata)).appendTo($('#depenency-info'));
	}).fail(function(xhr) {
		console.error("Organizr Function: Dependencies Connection Failed");
	});
}
function buildDependencyInfo(arrayItems){
	var listing = '';
	$.each(arrayItems.data.status.dependenciesActive, function(i,v) {
			listing += '<li class="depenency-item" data-name="'+v+'"><a href="javascript:void(0)"><i class="fa fa-check text-success"></i> '+v+'</a></li>';
		});
	$.each(arrayItems.data.status.dependenciesInactive, function(i,v) {
		listing += '<li class="depenency-item" data-name="'+v+'"><a href="javascript:void(0)"><i class="fa fa-close text-danger"><div class="notify"><span class="heartbit"></span></div></i> '+v+'</a></li>';
	});
	return listing;
}
function buildWebFolder(arrayItems){
	var writable = (arrayItems.data.status.writable == 'yes') ? 'Writable - All Good' : 'Not Writable - Please fix permissions';
	var className = (writable == 'Writable - All Good') ? 'bg-primary' : 'bg-danger text-warning';
	$('#web-folder').addClass(className);
	return writable;

}
function buildBrowserInfo(){
	var listing = '';
	$.each(activeInfo, function(i,v) {
		listing += `
		<tr>
			<td>`+i+`</td>
			<td>`+tof(v)+`</td>
		</tr>
		`;
	});
	return `
	<table class="table table-hover">
		<tbody>
			`+listing+`
		</tbody>
	</table>
	`;
}
function tof(string,type){
	var result;
	if (typeof string == 'undefined' || string == 'false' || string == false || string == null || string == 0 || string == 'off' || string == 'no') {
		result = "0";
	}else if (string == 'true' || string == true || string == 1 || string == 'on' || string == 'yes') {
		result = "1";
	}
	switch (type) {
		case 'bool':
		case 'b':
			return (result == "0") ? (false) : ((result == "1") ? (true) : (string));
			break;
		case 'switch':
		case 's':
			return (result == "0") ? ('off') : ((result == "1") ? ('on') : (string));
			break;
		case 'checkbox':
		case 'c':
			return (result == "0") ? ('') : ((result == "1") ? ('checked') : (string));
			break;
		case 'integer':
		case 'number':
		case 'i':
		case 'n':
			return (result == "0") ? (0) : ((result == "1") ? (1) : (string));
			break;
		case 'question':
		case 'q':
			return (result == "0") ? ('yes') : ((result == "1") ? ('no') : (string));
			break;
		default:
			return (result == "0") ? ("false") : ((result == "1") ? ("true") : (string));
	}
}
function createRandomString( length ) {
	var str = "";
	for ( ; str.length < length; str += Math.random().toString( 36 ).substr( 2 ) );
	return str.substr( 0, length );
}
function generateAPI(){
	var string = createRandomString(20);
	$('#form-api').focus();
	$('#form-api').val(string);
	$('#form-api').focusout();
	$('#verify-api').text(string);
	$('#form-username').focus();
}
function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for(var i = 0; i <ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}
function localStorageSupport() {
    return (('localStorage' in window) && window['localStorage'] !== null)
}
function local(type,key,value=null){
	if (localStorageSupport) {
		switch (type) {
			case 'set':
			case 's':
				localStorage.setItem(key,value);
				break;
			case 'get':
			case 'g':
				return localStorage.getItem(key);
				break;
			case 'remove':
			case 'r':
				localStorage.removeItem(key);
				break;
			default:
			console.warn('Organizr Function: localStorage action not defined');
		}
	}
}
function language(language){
	var language = language.split("-");
	return language[0];
}
function logIcon(type){
	switch (type) {
		case "success":
			return '<i class="fa fa-check text-success"></i>';
			break;
		case "warning":
			return '<i class="fa fa-exclamation-triangle text-warning"></i>';
			break;
		case "error":
			return '<i class="fa fa-close text-danger"></i>';
			break;
		default:
	}
}
function radioLoop(element){
	$('[type=radio][id!="'+element.id+'"]').each(function() { this.checked=false });
}
function loadAppearance(appearance){
	//console.log(appearance);
	if(appearance.useLogo === false){
		$('#main-logo').html(appearance.title);
		$('#side-logo').html(appearance.title);
	}else{
		$('#main-logo').html('<img alt="home" class="dark-logo" height="60px" src="'+appearance.logo+'">');
		$('#side-logo').html('<img alt="home" height="35px" src="'+appearance.logo+'">');
	}
	if(appearance.headerColor !== ''){
		$('.navbar-header').css("background", appearance.headerColor);
	}
}
function clearForm(form){
	$(form+" input[type=text]", form+" input[type=password]").each(function() {
        $(this).val('');
    })
}
function checkMessage(){
	var check = (local('get','message')) ? local('get','message') : false;
	if(check){
		local('remove', 'message');
		var message = check.split('|');
		messageSingle(window.lang.translate(message[0]),window.lang.translate(message[1]),'bottom-right','#FFF',message[2],'10000');
	}
}
function launch(){
	organizrConnect('api/?v1/launch_organizr').success(function (data) {
		var json = JSON.parse(data);
		if(json.data.user == false){ location.reload(); }
		currentVersion = json.data.status.version;
		activeInfo = {
			timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,
			offest:new Date().getTimezoneOffset(),
			language:language(moment.locale(navigator.languages[0])),
			browserVersion:bowser.name,
			browserName:bowser.version,
			mobile:bowser.mobile,
			tablet:bowser.tablet,
			osName:bowser.osname,
			osVersion:bowser.osversion,
			serverOS:json.data.status.os,
			phpVersion:json.data.status.php,
			token:json.data.user.token,
			branch:json.branch
		};
		console.log("%cOrganizr","color: #66D9EF; font-size: 24px; font-family: Monospace;");
		console.log("%cVersion: "+currentVersion,"color: #AD80FD; font-size: 12px; font-family: Monospace;");
		console.log("%cStarting Up...","color: #F92671; font-size: 12px; font-family: Monospace;")
		switch (json.data.status.status) {
			case "wizard":
				buildWizard();
				buildLanguage('wizard');
				break;
			case "dependencies":
				buildDependencyCheck(json);
				break;
			case "ok":
				loadAppearance(json.appearance);
				userMenu(json);
				categoryProcess(json);
				tabProcess(json);
				break;
			default:
				console.error('Organizr Function: Action not set or defined');
		}
	});
	checkMessage();
}