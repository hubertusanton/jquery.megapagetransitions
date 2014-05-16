/** ==========================================================

* jQuery mega page transitions
* This plugin depends on the GreenSock Animation platform [ http://www.greensock.com/gsap-js/ ]
* http://www.github.com/hubertusanton/jquery.megapagetransitions
* Released under the Apache License - http://opensource.org/licenses/Apache-2.0

=========================================================/**/
;(function($) {

	$.megaPageTransitions = function (el, options) {
		
		var defaults = {
			useNextPrevNav: true, // wether to use next/ prev nav 
			useDirectNav: true, // wether to use direct nav menu
			selectorNextPrevNav: '#navs', // selection of the next prev navs: div#navs a#previous-button && div#navs a#next-button 
			selectorDirectNav: '#direct-navs', // selection of the direct navs: #direct-navs ul#nav li a 
			animSpeed : 1, // the speed of the transition animation
			useNextPrevNavAutoTitles: false, // automatically set nextprev titles from directNav 
			useLightTransitions: false, // use light transitions (for old devices) no greensock used
			onBeforeStart: function () {}, // called before init
			onBeforeDirectNav: function () {}, // called before navigation by direct nav
			onAfterDirectNav: function () {}, // called after navigation by direct nav
			onBeforeMoveToArticle: function () {}, // called before moving to article
			onBeforeMoveNextArticle: function () {}, // called before next navigation
			onAfterMoveNextArticle: function () {}, // called after next navigation
			onBeforeMovePrevArticle: function () {}, // called before prev navigation
			onAfterRefreshNextPrevNav: function () {} // called after refresh of next prev navigation
		};

		var plugin = this;

		// define settings
		plugin.settings      = {}

		// define global document body & html
		plugin.document_body = $(document.body);
		plugin.document_html = $(document.documentElement);

		plugin.articles      = {}

		var init_load_hash = '';

		// init method
		var init = function() {
			plugin.settings = $.extend({}, defaults, options);
			plugin.el = el;

			plugin.el.each(function() {
				
				plugin.articles = el.children();

			});

			plugin.settings.onBeforeStart.call(this);

			init_articles();
			
			if (plugin.settings.useNextPrevNav) {
				init_next_prev_nav();
			}
			if (plugin.settings.useDirectNav) {
				init_direct_nav();
			}
			if (plugin.settings.useNextPrevNav) {
				refresh_next_prev_nav();
			}

			// getting initial hash and scrolling to it if it exists
			var value = window.location.hash.replace('#', '').split('/');
			var destiny = value[0];

			if(destiny.length){
					
				plugin.init_load_hash = destiny;				

			}

		}		

		var settings = $.extend(true, {}, defaults, options);



		/* 
		* private method scroll_top
		* for scrolling to top of page
		*/
		var scroll_top = function() {
			plugin.document_body.add(plugin.document_html).scrollTop(0);
		}

		/*
		* private method init_articles
		* for init of articles on screen
		* all the articles height is set to 0 
		* except article with class 'active' 
		*/
		var init_articles = function() {

			plugin.articles.each(function() {

				$(this).attr('data-article-height', $(this).height() + 40);

				$(this).css('overflow', 'hidden');

				if (!$(this).hasClass('active')) {
					$(this).css('height', '0');
				}

			});
		}		

		/* 
		* private method init_next_prev_nav
		* for init of events on next and prevous buttons
		*/
		var init_next_prev_nav = function() {

			$(plugin.settings.selectorNextPrevNav + ' #next-button').click(function(event) {
				event.preventDefault();
				plugin.move_next_article();		
			});

			$(plugin.settings.selectorNextPrevNav + ' #previous-button').click(function(event) {
				event.preventDefault();
				plugin.move_prev_article();		
			});

		}

		/* 
		* private method for initiation of direct navigation
		* 
		*/
		function init_direct_nav() {

			$(plugin.settings.selectorDirectNav + ' ul li').each(function(index) {

				$link = $(this).find('a');

				if ($link.length) {
					$link.click(function (event) {
						event.preventDefault();
						var num_article = index + 1;
						plugin.settings.onBeforeDirectNav.call(this);
						plugin.move_to_article(num_article);
						plugin.settings.onAfterDirectNav.call(this);
					});
				}

				
			});

		}			

		/* 
		* private method refresh_next_prev_nav
		* for refreshing nextprevnav after navigating to new article
		*/
		var refresh_next_prev_nav = function() {
			
			if (!plugin.settings.useNextPrevNav) {
				return;
			}

			$next_article    = plugin.get_current_article().next('div.page');
			$prev_article    = plugin.get_current_article().prev('div.page');

			if ($next_article.is('div.page')) {
				if (plugin.settings.useNextPrevNavAutoTitles && plugin.settings.useDirectNav) {

					$next_article_index      = $next_article.index();
					$next_article_link_title = $(plugin.settings.selectorDirectNav + ' ul li:eq(' + $next_article_index + ') a').text();
					
					$(plugin.settings.selectorNextPrevNav + ' a#next-button').contents().filter(function(){ 
						return this.nodeType == 3; 
					})[0].nodeValue = $next_article_link_title;

				}
				$(plugin.settings.selectorNextPrevNav + ' a#next-button').show();
			}
			else {
				$(plugin.settings.selectorNextPrevNav + ' a#next-button').hide();	
			}

			if ($prev_article.is('div.page')) {
				if (plugin.settings.useNextPrevNavAutoTitles && plugin.settings.useDirectNav) {

					$prev_article_index      = $prev_article.index();
					$prev_article_link_title = $(plugin.settings.selectorDirectNav + ' ul li:eq(' + $prev_article_index + ') a').text();

					$(plugin.settings.selectorNextPrevNav + ' a#previous-button').contents().filter(function(){ 
						return this.nodeType == 3; 
					})[0].nodeValue = $prev_article_link_title;					

				}				
				$(plugin.settings.selectorNextPrevNav + ' a#previous-button').show();
			}
			else {
				$(plugin.settings.selectorNextPrevNav + ' a#previous-button').hide();	
			}	

			//scroll_top();
				
			plugin.settings.onAfterRefreshNextPrevNav.call(this);

		}  

		/* 
		* public method to move to page when init hash is set
		*/
		plugin.move_to_init_hash = function() {

			if (plugin.init_load_hash == '') return;
			
			var goto_anchor = $('[data-anchor="'+plugin.init_load_hash+'"]');

			if(goto_anchor.length){
				var num_article = goto_anchor.index() + 1;
				plugin.move_to_article(num_article);
			}
		}

		/* 
		* public method move_to_article
		* for navigating to a given article
		*/
		plugin.move_to_article = function(num_article) {

			$anim_speed = plugin.settings.animSpeed;

			// if no num_article defined stop
			if(typeof(num_article)==='undefined') return;

			plugin.settings.onBeforeMoveToArticle.call(this, num_article);
			

			$to_article = plugin.el.find('div.page:nth-child(' + num_article + ')');

			if ($to_article.is('div.page')) {
				
				$current_article = plugin.get_current_article();

				// if currently active item is chosen do nothing
				if ($current_article.is($to_article)) {
					return;
				}
				
				scroll_top();

				var to_article_height = $to_article.attr('data-article-height');

				if (plugin.settings.useLightTransitions) {
					scroll_top();					
					$current_article.css('height', '0px');
					$to_article.css('height', to_article_height + 'px');
				}
				else {				
					// for now, always use light transitions
					$current_article.css('height', '0px');
					$to_article.css('height', to_article_height + 'px');

				}

				$current_article.removeClass('active');		
				$to_article.addClass('active');		

				refresh_next_prev_nav();		

				// set hash to to_article hash
				anchorLink    = $to_article.attr('data-anchor');
				location.hash = anchorLink;						
				
			}				


		}

		/* 
		* public method move_prev_article
		* for navigating to the previous article
		*/
		plugin.move_prev_article = function() {

			plugin.settings.onBeforeMovePrevArticle.call(this);

			$anim_speed = plugin.settings.animSpeed;
			
			$prev_article    = plugin.el.find('div.page.active').prev('div.page');			

			if ($prev_article.is('div.page')) {
				
				$current_article = plugin.get_current_article();
				
				scroll_top();

				var prev_article_height = $prev_article.attr('data-article-height');

				if (plugin.settings.useLightTransitions) {
					scroll_top();						
					$current_article.css('height', '0px');
					$prev_article.css('height', prev_article_height + 'px');
				}
				else {		

					var current_article_height       = $current_article.attr('data-article-height');

					var tl = new TimelineLite({
						paused: true,
						onComplete : refresh_next_prev_nav
					})

					tl.insert(TweenMax.to($prev_article, 0, { 
						height: prev_article_height + 'px'
					}));

					tl.insert(TweenMax.to($current_article, 0, { 
						height: 0
					}));					

					tl.insert(TweenMax.to(window, 0, {
						scrollTo:{y:prev_article_height, x:0} 
					}));

					tl.insert(TweenMax.to(window, $anim_speed, {
						scrollTo:{y:0, x:0},
						ease:Sine.easeOut
					}));
					
					tl.play();

				}

				$current_article.removeClass('active');	
				$prev_article.addClass('active');	

				// set hash to prev article hash
				anchorLink    = $prev_article.attr('data-anchor');
				location.hash = anchorLink;				
				
			}		

		}	


		/* 
		* public method move_next_article
		* for navigating to the next article
		*/
		plugin.move_next_article = function() {

			plugin.settings.onBeforeMoveNextArticle.call(this);

			$anim_speed = plugin.settings.animSpeed;
			
			$next_article    = plugin.get_current_article().next('div.page');

			if ($next_article.is('div.page')) {

				$current_article = plugin.get_current_article();
			
				var next_article_height = $next_article.attr('data-article-height');
				
				if (plugin.settings.useLightTransitions) {
					scroll_top();						
					$current_article.css('height', '0px');
					$next_article.css('height', next_article_height + 'px');
				}
				else {

					var tl = new TimelineLite({
						paused: true,
						onComplete : function() {
							plugin.settings.onAfterMoveNextArticle.call(this, $current_article);
							refresh_next_prev_nav();
						}
					})

					var current_article_height       = $current_article.attr('data-article-height');

					
					tl.insert(TweenMax.to($next_article, 0, { 
						height: next_article_height + 'px'
					}));

					tl.insert(TweenMax.to(window, $anim_speed, {
						scrollTo:{y:current_article_height, x:0,
							ease:Sine.easeOut } 
					}));	

					tl.insert(TweenMax.to(window, 0, {
						scrollTo:{y:0, x:0}, 
						delay: $anim_speed
					}));
									
					tl.insert(TweenMax.to($current_article, 0, { 
						height: 0,
						delay: $anim_speed
					}));
									

				
					tl.play();

				}


				$current_article.removeClass('active');		
				$next_article.addClass('active');

				// set hash to next article hash
				anchorLink    = $next_article.attr('data-anchor');
				location.hash = anchorLink;
				
			}					
		}


		/* 
		* public method for getting current active article
		*/
		plugin.get_current_article = function() {
			return plugin.el.find('div.page.active');
		}


		init();


		// using keys to navigate
		$(document).keydown(function(e) {

			switch (e.which) {

				//up
				case 38:
				case 33:
					//plugin.move_prev_article();
				break;

				//down
				case 40:
				case 34:
					//plugin.move_next_article();
				break;

				default:
				return; // exit this handler for other keys
			}
		});


		
	}


}(jQuery));