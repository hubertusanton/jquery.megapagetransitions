jQuery(window).load(function() {

	$.megaPageTransitions($('#articles-container'));
	
	/*
	$.megaPageTransitions($('#articles-container'), {
		useNextPrevNav: true,
		useDirectNav: true,
		onBeforeStart: function() {alert('go');},
		onBeforeDirectNav: function () {alert('go');},
		onAfterDirectNav: function () {alert('go');},
		onBeforeMoveNextArticle: function () {alert('go');},
		onBeforeMovePrevArticle: function () {alert('go');},
		animSpeed: 4
	});
	*/

});