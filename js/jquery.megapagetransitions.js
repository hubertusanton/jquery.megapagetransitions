/** ==========================================================

* jQuery mega page transitions
* This plugin depends on the GreenSock Animation platform [ http://www.greensock.com/gsap-js/ ]
* http://www.github.com/hubertusanton/jquery.megapagetransitions
* Released under the Apache License - http://opensource.org/licenses/Apache-2.0

=========================================================/**/
;(function($) {

	$.megaPageTransitions = function (el, options) {
		
		var defaults = {
			useNextPrevNav: true,
			useDirectNav: true,
			selectorNextPrevNav: '#navs',
			selectorDirectNav: '#direct-navs',
			animSpeed : 1,
			onBeforeStart: function () {},
			onBeforeDirectNav: function () {},
			onAfterDirectNav: function () {},
			onBeforeMoveNextArticle: function () {},
			onBeforeMovePrevArticle: function () {}
		};

		var plugin = this;

		// define settings
		plugin.settings      = {}

		// define global document body & html
		plugin.document_body = $(document.body);
		plugin.document_html = $(document.documentElement);

		plugin.articles      = {}

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

				$(this).attr('data-article-height', $(this).height());

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

			$next_article    = plugin.el.find('article.active').next('article');
			$prev_article    = plugin.el.find('article.active').prev('article');

			if ($next_article.is('article')) {
				$(plugin.settings.selectorNextPrevNav + ' #next').show();
			}
			else {
				$(plugin.settings.selectorNextPrevNav + ' #next').hide();	
			}

			if ($prev_article.is('article')) {
				$(plugin.settings.selectorNextPrevNav + ' #previous').show();
			}
			else {
				$(plugin.settings.selectorNextPrevNav + ' #previous').hide();	
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

			$to_article = plugin.el.find('article:nth-child(' + num_article + ')');

			if ($to_article.is('article')) {
				
				$current_article = plugin.el.find('article.active');

				// if currently active item is chosen do nothing
				if ($current_article.is($to_article)) {
					return;
				}
				
				scroll_top();

				$current_article.removeClass('active');		
				$to_article.addClass('active');			

				// zoomout current
				var to_anim1 = TweenLite.to($current_article, $anim_speed, {
					scale:0.8, 
					x:0, 
					y:'-10%', 
					z:0, 
					opacity: 0, 
					height: '0px' 
				});			

				// 
				var to_article_height = $to_article.attr('data-article-height');

				// zoomin new
				var to_anim2 = TweenLite.to($to_article, $anim_speed, {
					scale:1, 
					x:0, 
					y:0, 
					z:0, 
					opacity: 1, 
					height: to_article_height + 'px'
				});			

				// animation timeline
				var tl = new TimelineLite({
					paused: true,
					onComplete : refresh_next_prev_nav
				});

				tl.insert(to_anim1);
				tl.insert(to_anim2);
				tl.play();
				
			}				


		}

		/* 
		* public method move_prev_article
		* for navigating to the previous article
		*/
		plugin.move_prev_article = function() {

			plugin.settings.onBeforeMovePrevArticle.call(this);

			$anim_speed = plugin.settings.animSpeed;
			
			$prev_article    = plugin.el.find('article.active').prev('article');			

			if ($prev_article.is('article')) {
				
				$current_article = plugin.el.find('article.active');
				
				scroll_top();

				// slide up current using greensock
				var prev_anim1 = TweenLite.to($current_article, $anim_speed, { 
					height: '0px' 
				});	

				// zoomin previous 
				var prev_article_height = $prev_article.attr('data-article-height');
				var prev_anim2 = TweenLite.to($prev_article, $anim_speed, {
					scale:1, 
					x:0, 
					y:0, 
					z:0, 
					opacity: 1, 
					height: prev_article_height + 'px'
				});

				// timeline form animations
				var tl = new TimelineLite({
					paused: true,
					onComplete : refresh_next_prev_nav
				});


				tl.insert(prev_anim1);
				tl.insert(prev_anim2);
				tl.play();			

				$current_article.removeClass('active');	
				$prev_article.addClass('active');	
				
			}		

		}	


		/* 
		* public method move_next_article
		* for navigating to the next article
		*/
		plugin.move_next_article = function() {

			plugin.settings.onBeforeMoveNextArticle.call(this);

			$anim_speed = plugin.settings.animSpeed;
			
			$next_article    = plugin.el.find('article.active').next('article');

			if ($next_article.is('article')) {
				
				$current_article = plugin.el.find('article.active');
				
				scroll_top();

				// slidedown nex using greensock
				var next_article_height = $next_article.attr('data-article-height');
				var next_anim1 = TweenLite.to($next_article, $anim_speed, { 
					height: next_article_height + 'px',
					opacity: 1,
					scale:1 
				});			

				// zoomout current
				var next_anim2 = TweenLite.to($current_article, $anim_speed, {
					scale:0.8, 
					x:0, 
					y:'-10%', 
					z:0, 
					opacity: 0, 
					height: '0px', 
				});			

				// timeline for animations
				var tl = new TimelineLite({
					paused: true,
					onComplete : refresh_next_prev_nav
				});


				tl.insert(next_anim1);
				tl.insert(next_anim2);
				tl.play();

				$current_article.removeClass('active');		
				$next_article.addClass('active');
				
			}					
		}



		init();
		
	}


}(jQuery));