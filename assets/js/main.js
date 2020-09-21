/*! teachwiki-marketing-site v0.0.1 | (c) 2020  | MIT License | https://github.com/teachwiki */
/* globals imagesLoaded */

// Safari checks
const ua = window.navigator.userAgent.toLowerCase();
const isiPad = ua.indexOf('ipad') > -1 || (ua.indexOf('macintosh') > -1 && 'ontouchend' in document);
const isiOS = isiPad || !!navigator.platform.match(/iPhone|iPod|iPad/);
const isSafari = !!navigator.platform.match(/iPhone|iPod|iPad/) || window.safari !== undefined;

if (isSafari || isiOS) {
    document.body.classList.add('safari');
}

//Datalayer events for tracking Marketo forms in GTM
(function (document, window, undefined) {
    var dataLayer = window.dataLayer;
    try {
        if (window.MktoForms2) {
            window.MktoForms2.whenReady((function (form) {
                var form_id = form.getId();
                var $form = form.getFormElem();
                var eventName = null;

                if (form_id === 1029) {
                    eventName = 'pjs_demo_request_form_submission';
                }
                else if (form_id === 2283) {
                    eventName = 'Enterprise Consult Form';
                }

                dataLayer.push({
                    'event': 'marketo.loaded',
                    'marketo.form_id': form_id
                });

                form.onSubmit((function () {
                    dataLayer.push({
                        'event': 'marketo.submit',
                        'marketo.form_id': form_id
                    });
                }));

                form.onSuccess((function (values, followUpUrl) {
                    if (eventName) {
                        window['optimizely'] = window['optimizely'] || [];
                        window['optimizely'].push({
                            type: 'event',
                            eventName: eventName,
                            tags: {
                                revenue: 0,
                                value: 0
                            }
                        });
                    }
                    dataLayer.push({
                        'event': 'marketo.success',
                        'marketo.form_id': form_id,
                        'marketo.form_values': values,
                        'marketo.follow_up_url': followUpUrl
                    });
                }));
            }));
        }
    } catch (err) {
        console.log(err);
    }
})(document, window);

const setGreenhouseCookie = (name, value, days) => {
    var date = new Date();
    var expires = '';
    if (days) {
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/';
};

const getGreenhouseCookie = (name) => {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    var i = 0;
    var c = null;
    for (i = 0; i < ca.length; i++) {
        c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1, c.length);
        }

        if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;
};

checkOptimizelyCookie();

function checkOptimizelyCookie() {
    setGreenhouseCookie('ghcookie', 'testcookie', 7);
}

//GDPR
const gdprNotification = document.querySelector('#gdpr-notification');

const hideGDPR = () => {
    gdprNotification.classList.add('hidden');
    setGreenhouseCookie('gdprDismissed', 'true', 30);
};

if (gdprNotification) {
    const button = gdprNotification.querySelector('button');

    if (!getGreenhouseCookie('gdprDismissed')) {
        gdprNotification.classList.remove('hidden');
        button.addEventListener('click', hideGDPR);
    }
}

//Media query matches
const isAboveMobile = window.matchMedia('(min-width: 768px)');
const isBelowDesktop = window.matchMedia('(max-width: 1023px)');

//Navigation Helpers
const FOCUSABLE_ELEMENT_SELECTORS = 'a, button, input';
const mainNavWrapper = document.querySelector('#main-navigation');
const nav = document.querySelector('.nav');
const navChildren = document.querySelectorAll('.nav__drawer a');
const mobileNavControl = document.querySelector('.mobile-nav-control');

if (isBelowDesktop.matches) {
    mainNavWrapper.setAttribute('aria-hidden', 'true');
}

const trapFocus = (el, selectors = FOCUSABLE_ELEMENT_SELECTORS) => {
    const focusableElements = el.querySelectorAll(selectors);
    const firstFocusableEl = focusableElements[0],
        lastFocusableEl = focusableElements[focusableElements.length - 1];

    firstFocusableEl.focus();
    const keyboardHandler = e => {
        if (e.keyCode === 9) {
            //Rotate Focus
            if (e.shiftKey && document.activeElement === firstFocusableEl) {
                e.preventDefault();
                lastFocusableEl.focus();
            } else if (!e.shiftKey && document.activeElement === lastFocusableEl) {
                e.preventDefault();
                firstFocusableEl.focus();
            }
        }
    };
    el.addEventListener('keydown', keyboardHandler);
};

const toggleAriaExpanded = el => {
    let expanded = el.getAttribute('aria-expanded');
    el.setAttribute('aria-expanded', expanded === 'false' ? 'true' : 'false');
};

const toggleAriaHiddenAndTabindex = el => {
    let hidden = el.getAttribute('aria-hidden');
    el.setAttribute('aria-hidden', hidden === 'false' ? 'true' : 'false');
    el.setAttribute('tabindex', hidden === 'false' ? '-1' : '0');
};

const navigationButtons = {
    mobileNavToggle: document.querySelector('.nav__hamburger'),
    mobileSubnavClose: document.querySelector('.close_subNav'),
    navigationItemToggle: document.querySelectorAll('.nav__button')
};

const toggleBodyScrolling = () => {
    document.body.classList.toggle('no-scroll');
};

const removeActiveClasses = () => {
    navigationButtons.mobileSubnavClose.classList.remove('in');
    navigationButtons.navigationItemToggle.forEach(item => {
        item.closest('li').classList.remove('active');
    });
};

const hideFromTabbing = (elems) => {
    elems.forEach(item => {
        item.setAttribute('aria-hidden', 'true');
        item.setAttribute('tabindex', '-1');
    });
};

//Close on outside click & esc.
const closeOnOutsideClick = event => {
    if (!nav.contains(event.target)) {
        removeCloseNavClickListeners();
        closeMenu();
        closeSearchDrawer();
    }
    return;
};

const closeOnEsc = event => {
    if (event.keyCode === 27) {
        removeCloseNavClickListeners();
        closeMenu();
        closeSearchDrawer();
    }
};

const addCloseNavClickListeners = () => {
    document.addEventListener('click', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEsc);
};

const removeCloseNavClickListeners = () => {
    document.removeEventListener('click', closeOnOutsideClick);
    document.removeEventListener('keydown', closeOnEsc);
};

//Search Form
const searchButton = document.querySelector('.nav__search');
const searchDrawer = document.querySelector('.nav-search__drawer');
let formElements = searchDrawer.querySelectorAll('#search input, #search button');

const toggleSearchDrawer = (event) => {
    let _this = event.target;
    nav.classList.toggle('nav-search--active');
    nav.classList.add('transitions'); //don't allow CSS transitions on page load

    formElements.forEach(item => {
        toggleAriaHiddenAndTabindex(item);
    });
    toggleAriaExpanded(_this);

    if (nav.classList.contains('nav-search--active')) {
        trapFocus(searchDrawer);
        addCloseNavClickListeners();
    }
};

const closeSearchDrawer = () => {
    nav.classList.remove('nav-search--active');
    toggleAriaExpanded(searchButton);
    formElements.forEach(item => {
        toggleAriaHiddenAndTabindex(item);
    });
};

searchButton.addEventListener('click', toggleSearchDrawer);

const toggleMainNavAriaHidden = () => {
    if (mainNavWrapper.getAttribute('aria-hidden') === 'false') {
        mainNavWrapper.setAttribute('aria-hidden', 'true');
    } else {
        mainNavWrapper.setAttribute('aria-hidden', 'false');
    }
};

//Mobile Main Navigation Drawer
const toggleMobileSubNavControl = () => { //Toggles < button that closes subnav
    mobileNavControl.classList.toggle('hidden');
    nav.classList.toggle('subnav--active');
    toggleAriaHiddenAndTabindex(mobileNavControl);
    // only ever toggle aria-hidden on main nav on mobile. desktop should always be aria-hidden false
    if (isBelowDesktop.matches) {
        toggleMainNavAriaHidden();
    }
};

const toggleMobileNav = event => {
    let _this = event.target;
    let main = document.querySelector('#main');
    let footer = document.querySelector('.footer');

    toggleBodyScrolling(); //stop body scrolling
    closeSearchDrawer();
    nav.classList.toggle('nav--active'); //open nav
    nav.classList.add('transitions'); //don't allow CSS transitions on page load
    toggleMainNavAriaHidden();

    if (!mobileNavControl.classList.contains('hidden')) {
        toggleMobileSubNavControl();
    }

    if (nav.classList.contains('nav--active')) {
        addCloseNavClickListeners();
        navigationButtons.mobileNavToggle.innerHTML = 'Close mobile navigation';
        main.setAttribute('aria-hidden', 'true');
        footer.setAttribute('aria-hidden', 'true');
    } else {
        navigationButtons.mobileNavToggle.innerHTML = 'Open mobile navigation';
        main.setAttribute('aria-hidden', 'false');
        footer.setAttribute('aria-hidden', 'false');
    }

    removeActiveClasses(); //Make sure subnav is closed
    trapFocus(mainNavWrapper, '.nav__link, .nav__mobile-footer a, .nav__mobile-footer button, .nav__mobile-footer input'); // Trap keyboard focus to mobile nav
    hideFromTabbing(navChildren); // Make sure you can't tab through subnav
    toggleAriaExpanded(_this);
};

navigationButtons.mobileNavToggle.addEventListener('click', toggleMobileNav); //Toggle mobile navigation

//Mobile Subnav Close Button
const closeMobileSubnav = () => {
    let firstListItem = mainNavWrapper.getElementsByTagName('li')[0];
    let firstFocusableBtn = firstListItem.querySelector('button');
    removeActiveClasses(); //Close the drawer
    toggleMobileSubNavControl(); //Hide the < button
    hideFromTabbing(navChildren); // Make sure you can't tab through subnav
    firstFocusableBtn.focus();
};

navigationButtons.mobileSubnavClose.addEventListener('click', closeMobileSubnav); // Close subnavigation

// Desktop & Mobile Subnav Control
let navIsOpen = false;

const closeMenu = () => {
    nav.classList.remove('nav--active');
    if (!mobileNavControl.classList.contains('hidden')) {
        toggleMobileSubNavControl();
    }

    navIsOpen = false;
    navigationButtons.navigationItemToggle.forEach(item => {
        item.setAttribute('aria-expanded', false);
        item.closest('li').classList.remove('active', 'no-anim');
    });
    document.body.classList.remove('no-scroll');
    hideFromTabbing(navChildren);
};

const handleNavClick = event => {
    //Expand the nav list
    let _this = event.target;
    let parent = _this.closest('li');
    let drawer = parent.querySelector('.nav__drawer');

    //make sure search is closed
    nav.classList.remove('nav-search--active');
    nav.classList.add('transitions'); //don't allow CSS transitions on page load

    if (parent.classList.contains('active')) {
        //if we're open, close it.
        closeMenu();
        drawer.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
        return;
    }

    //If the nav is already opened, don't re-add the active class
    if (!navIsOpen) {
        nav.classList.add('nav--active');
        navIsOpen = true;
        addCloseNavClickListeners();
        document.body.classList.add('no-scroll');
        drawer.setAttribute('aria-hidden', 'false');
    } else {
        _this.closest('li').classList.add('no-anim');
    }

    removeActiveClasses();
    hideFromTabbing(navChildren);

    parent.classList.toggle('active');
    parent.querySelectorAll('a').forEach(link => {
        toggleAriaHiddenAndTabindex(link);
    });

    trapFocus(parent);
    toggleMobileSubNavControl(); //show arrow button on mobile nav

    //Accessibility
    toggleAriaExpanded(_this);
};

navigationButtons.navigationItemToggle.forEach(item => {
    item.addEventListener('click', handleNavClick);
});

//Close the nav when resizing to prevent green square weirdness
window.addEventListener('resize', () => {
    // only close menu if desktop, otherwise Android closes the mobile menu on input focus
    if (isAboveMobile.matches) {
        document.body.classList.remove('no-scroll');
        closeMenu();
        nav.classList.remove('transitions');
    }
    // hide main navigation from mobile screen readers on resize
    if (isBelowDesktop.matches) {
        mainNavWrapper.setAttribute('aria-hidden', 'true');
    } else {
        mainNavWrapper.setAttribute('aria-hidden', 'false');
    }
    // remove inline styles from category filters on resize
    if (isAboveMobile.matches && _categoryFilters) {
        _categoryFilters.removeAttribute('style');
    }
});

//Background transitions for narrative component
let backgroundTransitionElements = document.querySelectorAll('[data-background-color]');
let container = document.querySelector('.narrative');

const isInViewport = elem => {
    var bounding = elem.getBoundingClientRect();
    return (
        bounding.top - (window.innerHeight / 2) < 0 && bounding.top > - bounding.height
    );
};

const trackNarrativeScrolling = () => {
    window.addEventListener('scroll', () => {
        for (let i = 0; i < backgroundTransitionElements.length; i++) {
            let _this = backgroundTransitionElements[i];
            if (isInViewport(_this)) {
                let color = _this.getAttribute('data-background-color');
                let links = container.querySelectorAll('a');
                container.style.backgroundColor = color;

                if (color === '#15372C' || color === '#008561') {
                    container.style.color = '#FFFFFF';
                    links.forEach(item => {
                        item.style.color = '#FFFFFF';
                    });
                } else {
                    container.style.color = '';
                    links.forEach(item => {
                        item.style.color = '#008561';
                    });
                }
            }
        }
    });
};

if (backgroundTransitionElements.length) {
    trackNarrativeScrolling();
}

// Integrations sidebar filter elements and event listeners for mobile
let _sidebar = document.querySelector('.js-integrations-sidebar');
let _categoryFilters = document.querySelector('#category-filters');

function preventDefaultOnBody(e) {
    e.preventDefault();
}

function stopPropagationOnFilters(e) {
    e.stopPropagation();
}

function showCategoryFilters() {
    document.addEventListener('touchmove', preventDefaultOnBody, { passive: false });
    _categoryFilters.addEventListener('touchmove', stopPropagationOnFilters, { passive: false });
    document.body.classList.add('no-scroll');
    _categoryFilters.style.overflow = 'scroll';
}

function hideCategoryFilters() {
    document.removeEventListener('touchmove', preventDefaultOnBody, { passive: false });
    _categoryFilters.removeEventListener('touchmove', stopPropagationOnFilters, { passive: false });
    document.body.classList.remove('no-scroll');
    _categoryFilters.style.overflow = 'hidden';
}

//Collapseables
let collapseContainer = document.querySelector('.collapse-toggle-master');
let collapseHandles = document.querySelectorAll('.collapse-toggle');

const toggleCollapse = (event) => {
    event.preventDefault();
    let offset;
    let _this = event.target;
    let categoryFilter = _this.classList.contains('collapse-toggle-master');
    let _target = document.querySelector(`#${_this.getAttribute('aria-controls')}`);

    _this.classList.toggle('active');

    let height = _target.querySelector('.collapse-content').scrollHeight;
    if (_this.classList.contains('active')) {
        if (categoryFilter) {
            let sidebarPos = _sidebar.getBoundingClientRect().bottom;
            let targetHeight = window.innerHeight - sidebarPos;
            _target.style.height = targetHeight + 'px';
            showCategoryFilters();
        } else {
            _target.style.height = height + 'px';
        }
    } else {
        let categoryFilterHeight = _categoryFilters.offsetHeight - 30;
        _target.style.height = '0';
        if (categoryFilter) {
            if (isSafari) {
                window.scrollTo(0, window.scrollY - categoryFilterHeight);
            }
            hideCategoryFilters();
        }
    }

    if (!categoryFilter) {
        // scrolls into place
        if (window.innerWidth > 1024) {
            let desktopOffset = _this.getAttribute('data-offset-desktop');
            offset = desktopOffset ? desktopOffset : 101;
        } else {
            let mobile = _this.getAttribute('data-offset-mobile');
            offset = mobile ? mobile : 101;
        }
        scroll(_this, offset);

        // hides any other open drawers
        collapseHandles.forEach(item => {
            if (item !== _this) {
                item.classList.remove('active');

                let target = document.getElementById(item.getAttribute('aria-controls'));
                let subItems = item.querySelectorAll('a');

                target.style.height = '0';
                subItems.forEach(item => {
                    toggleAriaHiddenAndTabindex(item);
                });
            }
        });

        // toggles items on current open drawer
        let subItems = _target.querySelectorAll('a');
        subItems.forEach(item => {
            toggleAriaHiddenAndTabindex(item);
        });
    }
    //Accessibility
    toggleAriaExpanded(_this);
};

const initCollapseElements = () => {
    collapseContainer.addEventListener('click', toggleCollapse);
    collapseHandles.forEach(item => {
        item.addEventListener('click', toggleCollapse);
    });
};

if (collapseHandles.length) {
    initCollapseElements();
}

//Smooth scroll
const scroll = (element, offset) => {
    let targets = document.querySelectorAll(element.getAttribute('href'));

    let target = [].filter.call( targets, (function( el ) {
        return !!( el.offsetWidth || el.offsetHeight || el.getClientRects().length );
    }));

    if (target.length) {
        const y = target.shift().getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
            top: y,
            behavior: 'smooth'
        });
    }
};

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    if (anchor.classList.contains('skip')) {
        return;
    }
    if (anchor.classList.contains('.filter__title')) {
        return;
    }
    anchor.addEventListener('click', (function (e) {
        e.preventDefault();
        let offset;

        if (window.innerWidth > 1024) {
            let desktopOffset = anchor.getAttribute('data-offset-desktop');
            offset = desktopOffset ? desktopOffset : 77;
        } else {
            let mobile = anchor.getAttribute('data-offset-mobile');
            offset = mobile ? mobile : 65;
        }

        //on smaller screens, preload all hidden images before scrolling to the anchor
        if (window.matchMedia('(max-height: 1099px)').matches) {
            var offscreen = document.querySelectorAll('main .component-offscreen');

            var imgLoad = imagesLoaded(offscreen, { background: true }, (function() {
                scroll(anchor, offset);
            }));

            for (var i = 0, len = imgLoad.images.length; i < len; i++ ) {
                var image = imgLoad.images[i];
                preloadImage(image.img);
            }
        }
        else {
            scroll(anchor, offset);
        }
    }));
});

//Resource backgrounds
let resourceBackground = document.querySelector('.resource__background');

const checkHeight = () => {
    let resourceContent = resourceBackground.querySelector('.resource__content');
    let dimensions = resourceContent.getBoundingClientRect();
    if (dimensions.height < 991) {
        resourceBackground.classList.add('no-bg');
    } else {
        resourceBackground.classList.remove('no-bg');
    }
};

if (resourceBackground) {
    checkHeight();
    window.addEventListener('resize', checkHeight);
}
//Product Overview Component
let imageSelectors = document.querySelectorAll('.image__selector');

const changeOverviewImage = event => {
    event.preventDefault();

    let _this = event.target;
    let newImage = _this.getAttribute('data-image-index');
    //make sure this is constrained to current block
    let image = _this.closest('.productoverview').querySelector(`[data-index='${newImage}'`);
    let images = _this.closest('.productoverview').querySelectorAll('.productoverview__image');

    imageSelectors.forEach(item => {
        item.classList.remove('active');
    });
    images.forEach(item => {
        item.classList.remove('active');
    });
    _this.classList.add('active');
    image.classList.add('active');
};

if (imageSelectors.length) {
    imageSelectors.forEach(item => {
        item.addEventListener('click', changeOverviewImage);
    });
}

//Blockquote formatting
const blockQuotes = document.querySelectorAll('blockquote');

const formatBlockquotes = () => {
    blockQuotes.forEach(quote => {
        let closeQuote = document.createElement('span');
        closeQuote.classList.add('closeQuote');

        if (quote.querySelector('cite')) {
            quote.insertBefore(closeQuote, quote.querySelector('cite'));
        } else {
            quote.appendChild(closeQuote);
        }
    });
};

if (blockQuotes.length) {
    formatBlockquotes();
}

//Marketo Forms
const setupSuccessCallback = (form) => {
    //Don't just grab any marketo form, gated content forms function differently
    let id = form.getId();
    let formEl = document.querySelector(`.js-standard-mkto-form #mktoForm_${id}`);

    if (formEl) {
        form.onSuccess((function () {
            formEl.closest('.js-standard-mkto-form').classList.add('success');
            if (isBelowDesktop) {
                const thankyouDiv = document.querySelector('.show-on-success');
                if (thankyouDiv) {
                    const y = thankyouDiv.getBoundingClientRect().top + window.pageYOffset;
                    window.scrollTo({
                        top: y,
                        behavior: 'smooth'
                    });
                }
            }
            return false; //dont refresh
        }));
    }
};

const setupSubscriptionForm = (form) => {

    let id = form.getId();
    var formEl = form.getFormElem()[0];

    //Only do this for the Email Subscription form (english and german) (change the id to match the ID of that form)
    if((id=='2418' || id=='2608') && formEl){
        // Add custom class to this form for CSS
        formEl.classList.add('email-subscription-management-form');

        // Remove extra margin at the top of the page
        formEl.closest('.embeddedContent').style.marginTop = 0;

        // List the IDs for each checkbox
        let checkboxIds = [
            'optInAllNewsletters',
            'Opt_In_Modern_Recruiter_Newsletter__c',
            'Opt_In_Customer_Newsletter__c',
            'Opt_In_Partner_Newsletter__c',
            'optInProductAnnouncements',
            'Opt_In_Events_and_Webinars__c',
            'Opt_In_Hiring_Thought_Leadership__c',
            'Opt_in_Operational_Updates__c',
            'Unsubscribed'
        ];

        // List the IDs for the checkboxes that get grouped under "All Newsletters"
        let newsletterCheckboxIds = [
            'Opt_In_Modern_Recruiter_Newsletter__c',
            'Opt_In_Customer_Newsletter__c',
            'Opt_In_Partner_Newsletter__c'
        ];

        for (var i = 0; i < checkboxIds.length; i++) {
            var labelId = 'Lbl' + checkboxIds[i];
            var label = document.getElementById(labelId);

            if (label){
                var labelContent = label.innerHTML;
                var fieldWrapper = label.parentNode;
                var fieldWrapperChildren = fieldWrapper.childNodes;
                for (var j=0; j < fieldWrapperChildren.length; j++) {
                    if (fieldWrapperChildren[j].classList.contains('mktoCheckboxList')) {
                        var checkboxList = fieldWrapperChildren[j];
                        var secondLabel = checkboxList.querySelectorAll('label#'+labelId)[0];
                        if(newsletterCheckboxIds.includes(checkboxIds[i])){
                            secondLabel.classList.add('nested-checkbox-label');
                            checkboxList.classList.add('nested-checkbox');
                        }
                        secondLabel.classList.add('the-label-we-want');
                        // Copy contents of original label into second label for formatting purposes
                        secondLabel.innerHTML = labelContent;
                        break;
                    }
                }
                // Give original label a class so that it can be hidden
                label.classList.add('redundant-label');
            }
        }

        // Create 4 divs to layout the form fields
        var topDiv = document.createElement('div');
        var leftColumnDiv = document.createElement('div');
        var rightColumnDiv = document.createElement('div');
        var bottomDiv = document.createElement('div');

        // Assign some classes to the layout divs
        topDiv.classList.add('top-section');
        leftColumnDiv.classList.add('left-column','field-column');
        rightColumnDiv.classList.add('right-column','field-column');
        bottomDiv.classList.add('bottom-section');

        var topFields = 1; // put the first 1 field(s) above the columns
        var leftFields = 7; // place the next 7 field(s) in the left column
        var rightFields = 6; // place the next 6 field(s) in the right column

        // Place fields into layout divs according to the parameters above
        formEl.querySelectorAll('.mktoFormRow').forEach((function(row, i) {
            if(i+1 == topFields){
                topDiv.appendChild(row);
            }
            else if (i+1 <= topFields+leftFields){
                leftColumnDiv.appendChild(row);
            }
            else if (i+1 <= topFields+leftFields+rightFields){
                rightColumnDiv.appendChild(row);
            }
            else{
                bottomDiv.appendChild(row); // all other columns go after the columns
            }
        }));

        // Place layout divs into form element
        formEl.insertBefore(bottomDiv, formEl.firstChild);
        formEl.insertBefore(rightColumnDiv, formEl.firstChild);
        formEl.insertBefore(leftColumnDiv, formEl.firstChild);
        formEl.insertBefore(topDiv, formEl.firstChild);


        var allNewslettersField = formEl.querySelector('[name="optInAllNewsletters"]');
        var newsletterFields = formEl.querySelectorAll('.nested-checkbox input');
        var arrayFrom = getSelection.call.bind([].slice);

        // logic for checking and unchecking boxes when "All Newsletters" field is clicked
        allNewslettersField.addEventListener('click',(function(e) {
            if (allNewslettersField.checked) {
                arrayFrom(newsletterFields).forEach((function(el){
                  el.checked = true;
                }));
            }
            else{
                arrayFrom(newsletterFields).forEach((function(el){
                  el.checked = false;
                }));
            }
        }));

        // logic for checking and unchecking "All Newsletters" when newsletter checkboxes are clicked
        arrayFrom(newsletterFields).forEach((function(el){
            el.addEventListener('click',(function(e) {
                var unchecked = [].filter.call(newsletterFields, (function( el ) {
                    return !el.checked
                }));

                var checked = [].filter.call(newsletterFields, (function( el ) {
                    return el.checked
                }));

                if (newsletterFields.length == checked.length) {
                    allNewslettersField.checked = true;
                }
                else if (unchecked.length) {
                    allNewslettersField.checked = false;
                }

            }));
        }));

        // uncheck all other boxes when the unsubscribeAllField is checked
        var unsubscribeAllField = formEl.querySelector('[name="Unsubscribed"]');
        var allCheckboxes = formEl.querySelectorAll('input[type="checkbox"]:not([name="Unsubscribed"])');

        // logic for checking and unchecking boxes when "Unsubscribe" field is clicked
        unsubscribeAllField.addEventListener('click',(function(e) {
            if (unsubscribeAllField.checked) {
                arrayFrom(allCheckboxes).forEach((function(el){
                    if(el != unsubscribeAllField){
                      el.checked = false;
                    }

                }));
            }
        }));

        // logic for checking and unchecking "Unsubscribe" when other checkboxes are clicked
        arrayFrom(allCheckboxes).forEach((function(el){
            el.addEventListener('click',(function(e) {
                var checked = [].filter.call(allCheckboxes, (function( el ) {
                    return el.checked
                }));

                if (checked.length) {
                    unsubscribeAllField.checked = false;
                }
            }));
        }));

    }
};

if (typeof MktoForms2 !== 'undefined') {
  MktoForms2.onFormRender(setupSuccessCallback); // eslint-disable-line no-undef
}

if (typeof MktoForms2 !== 'undefined') {
  MktoForms2.onFormRender(setupSubscriptionForm); // eslint-disable-line no-undef
}

// Lazy Load Images
// config for all images. within 200px of intersection, start download
const lazyImageConfig = {
    rootMargin: '200px 0px',
    threshold: 0
};

// helper function that actually does the replacement
function preloadImage(element) {
    if (element.dataset && element.dataset.src) {
        element.src = element.dataset.src;
    }
    if (element.dataset && element.dataset.srcset) {
        element.srcset = element.dataset.srcset;
    }
}

// image observer doing the work
let imageObserver = new IntersectionObserver(function (entries, self) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            preloadImage(entry.target);
            self.unobserve(entry.target);
        }
    });
}, lazyImageConfig);

// get all images to-be-lazy-loaded and observe them
const imgs = document.querySelectorAll('[data-src], [data-srcset]');
imgs.forEach(img => {
    imageObserver.observe(img);
});

// Animate components
// config for all components. .10 threshhold to give component's images a chance to lazy load before component pops
// larger thresholds may cause issues with long rich-text boxes, as it's a % value of total height across the viewport.
const componentAnimationConfig = {
    rootMargin: '-200px 0px',
    threshold: 0
};

// component animation observer
let componentObserver = new IntersectionObserver(function (components, self) {
    components.forEach(component => {
        if (component.isIntersecting) {
            component.target.classList.add('component-is-showing');
            component.target.classList.remove('component-offscreen');
            self.unobserve(component.target);
        }
    });
}, componentAnimationConfig);

const components = document.querySelectorAll('.component-offscreen');
components.forEach(component => {
    componentObserver.observe(component);
});

// Force styles on embedded Ceros elements
let cerosElement = document.querySelectorAll('.resource__content figure iframe[src*=ceros]');

if (cerosElement.length) {
    cerosElement.forEach((el) => el.closest('figure').style.position = 'relative');
}

// Language Switch
var switches = document.getElementsByClassName('language-switch');
for (var i = 0; i < switches.length; i++) {
    switches[i].onchange = function() {
        var index = this.selectedIndex;
        var redirect = this.children[index].value;
        var parts = redirect.split('?lang=');
        redirect = parts[0];
        var cookieValue = parts[1];

        if (redirect != '' && cookieValue) {
            // set Geomate language overwrite
            setCookie('GeoMateRedirectOverride', cookieValue, 7);
            window.location.href = redirect;
        }

        function setCookie(name, value, days) {
            var expires = '';
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days*24*60*60*1000));
                expires = '; expires=' + date.toUTCString();
            }
            document.cookie = name + '=' + (value || '') + expires + '; path=/';
        }

    }
}
