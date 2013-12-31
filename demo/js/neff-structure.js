var bookConfig = {
    type: "book", 
    url: "TOC.html", 
    id: "TOC", 
    title: "Our Changing Planet",
    children: [
    {
        type: "chapter", 
        url: "chapter_12.html", 
        id: "12",
        ordinal: "12",
        title: "Human Populations",
        children: [
        {	
            type: "module", 
            url: "module_12.1.html", 
            id: "12.1", 
            title: "The History of Human Population Growth",
            children: [
            {		
                type: "objective", 
                url: "objective_12.1.1.html", 
                id: "12.1.1", 
                title: "How quickly does the human population grow?"
            },
            {		
                type: "objective", 
                url: "objective_12.1.2.html", 
                id: "12.1.2", 
                title: "How could the human population increase so quickly over the past 300 years?"            },
            {		
                type: "objective", 
                url: "objective_12.1.3.html", 
                id: "12.1.3", 
                title: "What continents and countries have grown the most?"            },
			{		
                type: "objective", 
                url: "assess_12.1.html", 
                id: "12.1.Q1", 
                title: "Population Growth Questions 1"
            },
			{		
                type: "objective", 
                url: "assess_12.2.html", 
                id: "12.1.Q2", 
                title: "Population Growth Questions 2"
            },
			{		
                type: "objective", 
                url: "assess_12.3.html", 
                id: "12.1.Q3", 
                title: "Population Growth Questions 3"
            }
            ]
        },
        {	
            type: "module", 
            url: "module_12.2.html", 
            id: "12.2", 
            title: "Age Structures and The Demographic Transition",
            children: [
            {		
                type: "objective", 
                url: "objective_12.2.1.html", 
                id: "12.2.1", 
                title: "Why are age structures and dependency ratios important?"	            },
            {		
                type: "objective", 
                url: "objective_12.2.2.html", 
                id: "12.2.2", 
                title: "How have birth and death rates changed over time?"            }
            ]
        },
        {	
            type: "module", 
            url: "module_12.3.html", 
            id: "12.3", 
            title: "Fertility and Human Population Growth",
            children: [
            {		
                type: "objective", 
                url: "objective_12.3.1.html", 
                id: "12.3.1", 
                title: "What is the best predictor of future population growth?"            },
            {		
                type: "objective", 
                url: "objective_12.3.2.html", 
                id: "12.3.2", 
                title: "Why are women a key factor in population growth?"            },
            {		
                type: "objective", 
                url: "objective_12.3.3.html", 
                id: "12.3.3", 
                title: "How can rapid population growth be slowed?"            },
            {		
                type: "objective", 
                url: "objective_12.3.4.html", 
                id: "12.3.4", 
                title: "What do demographic statistics tell us about future population growth?"            }
            ]
        },
        {	
            type: "module", 
            url: "module_12.4.html", 
            id: "12.4", 
            title: "Disease, Death, and Human Population Growth",
            children: [
            {		
                type: "objective", 
                url: "objective_12.4.1.html", 
                id: "12.4.1", 
                title: "What are the major causes of death today?"            },
            {		
                type: "objective", 
                url: "objective_12.4.2.html", 
                id: "12.4.2", 
                title: "Why has life expectancy increased, and what does this mean for population growth?"            }
            ]
        },
        {	
            type: "module", 
            url: "module_12.5.html", 
            id: "12.5", 
            title: "Environmental Impacts of the Human Population",
            children: [
            {		
                type: "objective", 
                url: "objective_12.5.1.html", 
                id: "12.5.1", 
                title: "Do all people have the same effect on the environment?"
            },
            {		
                type: "objective", 
                url: "objective_12.5.2.html", 
                id: "12.5.2", 
                title: "What role does technology play in environmental impacts?"
            },
            {		
                type: "objective", 
                url: "objective_12.5.3.html", 
                id: "12.5.3", 
                title: "What is an ecological footprint?"            }
            ]
        },
        {	
            type: "module", 
            url: "module_12.6.html", 
            id: "12.6", 
            title: "Future Human Population Trends",
            children: [
            {		
                type: "objective", 
                url: "objective_12.6.1.html", 
                id: "12.6.1", 
                title: "How many people will be on the planet by 2100?"            },
            {		
                type: "objective", 
                url: "objective_12.6.2.html", 
                id: "12.6.2", 
                title: "What would it take for the population to stabilize at 10 billion?"            },
            {		
                type: "objective", 
                url: "objective_12.6.3.html", 
                id: "12.6.3", 
                title: "What does population growth mean for the global environment?"            }
            ]
        }
        ]
    }
    ]
};


function tierDelve(tier, parent, root, ignore) {
    tier._parent = parent;
    root._lTiers.push(tier);
    
    ignore = ignore || tier.ignore;
    tier.ignore = ignore; // inherit sins of the father
    
    if (tier.children && tier.children.length)
    {
        for (var i = 0; i < tier.children.length; i++)
        {
            var child = tier.children[i];
            
            if (!child.ordinal) child.ordinal = i+1;
            tierDelve(child, tier, root, ignore);
        }
    }
}
 
function massageBookConfig(config) {
    config._lTiers = [];

    tierDelve(config, null, config, false);

    config.ordinal = -1;
    var lastGood = null;
    
    // Establish prev/next for the linear scheme
    for (var i = 0; i < config._lTiers.length; i++) {
        var tier = config._lTiers[i];
        //tier._lIndex = i;
        
        if (tier.ignore) {
            tier._prev = null;
            tier._next = null;
            continue;
        }
        
        if (lastGood) lastGood._next = tier;
        tier._prev = lastGood;
        
        /*
        tier._prev = i 
            //&& (config._lTiers[i-1].ordinal != -1) // Comment this out to put TOC at start of list
            ? config._lTiers[i-1] : null;
        tier._next = i < config._lTiers.length - 1 ? config._lTiers[i+1] : null;
        */
        
        lastGood = tier;
    }
    
    if (lastGood) {
        // wrap around the list
        lastGood._next = config._lTiers[0];
        config._lTiers[0]._prev = lastGood;
    }
}

function determineCurrentTier(config) {
    // For now we'll key on the filename component
    
    var shortUrl = window.location.href.substring(window.location.href.lastIndexOf("/")+1); // trailing component
    
    if (shortUrl.indexOf("#") != -1) shortUrl = shortUrl.substring(0, shortUrl.indexOf("#")); // trim arnchor
    if (shortUrl.indexOf("?") != -1) shortUrl = shortUrl.substring(0, shortUrl.indexOf("?")); // trim query
    
    for (var i = 0; i < config._lTiers.length; i++) {
        if (shortUrl == config._lTiers[i].url) return config._lTiers[i];
    }    
    
    return null;
}


// Do the actual stuff!

massageBookConfig(bookConfig);
var thisTier = determineCurrentTier(bookConfig); // global scope for use in subsequent js
//alert(thisTier.title);


