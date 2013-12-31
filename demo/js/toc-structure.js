var bookConfig = {
    type: "book",
    url: "TOC.html",
    id: "TOC",
    title: "Player Test Book",
    children: [
    {
        type: "chapter",
        url: "chapter_n.html",
        id: "n",
        ordinal: "n",
        title: "Player Test Book - Chapter Opener",
        children: [
        {
            type: "module",
            url: "module_n.1.html",
            id: "n.1",
            title: "Module Opener",
            children: [
            {
                type: "objective",
                url: "even-column.html",
                id: "n.1.1",
                title: "Objective Even-Column"
            },
            {
                type: "objective",
                url: "major-minor.html",
                id: "n.1.2",
                title: "Objective Major-Minor"
            },
            {
                type: "objective",
                url: "minor-major.html",
                id: "n.1.3",
                title: "Objective Minor-Major"
            },
            {
                type: "objective",
                url: "rows.html",
                id: "n.1.4",
                title: "Objective Rows"
            }
            ]
        },
        {
            type: "module",
            url: "module_n.2.html",
            id: "n.2",
            title: "Widget Tests",
            children: [
            {
                type: "objective",
                url: "axesTests.html",
                id: "n.2.1",
                title: "Axes Tests"
            },
            {
                type: "objective",
                url: "lineGraphTests.html",
                id: "n.2.2",
                title: "Line Graph Tests"
            },
            {
                type: "objective",
                url: "barGraphTests.html",
                id: "n.2.3",
                title: "Bar Graph Tests"
            },
            {
                type: "objective",
                url: "imageTests.html",
                id: "n.2.4",
                title: "Image, Carousel Tests"
            } ,
            {
                type: "objective",
                url: "labelCalloutTests.html",
                id: "n.2.5",
                title: "Label and Marker Tests"
            },
            {
                type: "objective",
                url: "tableCalloutTests.html",
                id: "n.2.6",
                title: "Callouts in Tables or singly"
            },
            {
                type: "objective",
                url: "pieTests.html",
                id: "n.2.7",
                title: "Pie Chart Tests"
            },
            {
                type: "objective",
                url: "sketchTests.html",
                id: "n.2.8",
                title: "Sketch Tests"
            },
			{
				type: "objective",
				url: "animationTests.html",
				id: "n.2.9",
				title: "Animation Tests"
			},
            {
                type: "objective",
                url: "sliderTests.html",
                id: "n.2.10",
                title: "Slider and Readout Tests"
            },
            {
                type: "objective",
                url: "buttonTests.html",
				id: "n.2.11",
                title: "Button Tests"
            },
            ]
        },
        {
            type: "module",
            url: "module_n.3.html",
            id: "n.3",
            title: "Demo Files",
            children: [
            {
                type: "objective",
                url: "KantorowskiRotation.html",
                id: "n.3.1",
                title: "Kantorowski Enantiomers Event Bars and Rotation"
            },
            {
                type: "objective",
                url: "NeffReactor.html",
                id: "n.3.2",
                title: "Neff Reactor Stepped Image"
            },
            {
                type: "objective",
                url: "PhysicsResistance.html",
                id: "n.3.3",
                title: "Resistance: Randomized Scatter Data and slider events"
            }, 
            {
                type: "objective",
                url: "NeffPopPredictions.html",
                id: "n.3.4",
                title: "Neff Population Predictions Updating Lines"
            },
            {
                type: "objective",
                url: "KantorAnimation.html",
                id: "n.3.5",
                title: "Stereoisomerism in Alkenes: Animation"
            },
			{
                type: "objective",
                url: "EnergyParabola.html",
                id: "n.3.6",
                title: "Mechanical Energy: Animation and Graph/Image coordination"
            }, 
			{
                type: "objective",
                url: "Brain.html",
                id: "n.3.7",
                title: "Cicerelli Brain hotspots"
            }, 
            {
                type: "objective",
                url: "KeelingCurve.html",
                id: "n.3.8",
                title: "The Keeling Curve"
            }, 
            {
                type: "objective",
                url: "OceanProps.html",
                id: "n.3.9",
                title: "Ocean Properties"
            }, 
            {
                type: "objective",
                url: "NeffBarAnim.html",
                id: "n.3.10",
                title: "Age Structure and Dependency Ratio"
            }, 
            {
                type: "objective",
                url: "GlobalEnergyUse.html",
                id: "n.3.11",
                title: "Global Energy Use"
            }, 
            ]
		},
		{
            type: "module",
            url: "module_n.4.html",
            id: "n.4",
            title: "Widget Assessment Tests",
            children: [
            {
                type: "objective",
                url: "multiChoiceTests.html",
                id: "n.4.1",
                title: "Multiple Choice Tests"
            },
			{
                type: "objective",
                url: "selectGroupTests.html",
                id: "n.4.1a",
                title: "Dropdown Selection Multiple Choice Tests"
            },
            {
                type: "objective",
                url: "multiSelectTests.html",
                id: "n.4.1b",
                title: "Multiple Select Tests"
            },
            {
                type: "objective",
                url: "labelScoreTests.html",
                id: "n.4.2",
                title: "Labeling Assessment Tests"
            },
            {
                type: "objective",
                url: "journalTests.html",
                id: "n.4.3",
                title: "Journal Assessment Tests"
            },
            ]
        },
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
