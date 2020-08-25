import * as d3 from 'd3'
import { D3Sel } from "./etc/Util"
import { LazySaliencyImages } from "./vis/LazySaliencyImages"
import { SingleSaliencyImage } from "./vis/SingleSaliencyImage"
import { ConfusionMatrix } from "./vis/ConfusionMatrix"
import { Histogram } from './vis/Histogram'
import { SimpleEventHandler } from './etc/SimpleEventHandler'
import { API } from './api/mainApi'
import { State, URLParameters } from './state'
import { caseStudyOptions, sortByOptions, predictionFnOptions, scoreFnOptions, labelFilterOptions } from './etc/selectionOptions'
import { SaliencyImg } from './types';

/**
 * Render static elements needed for interface
 */
function init(base: D3Sel) {
    const html = `
    <!--  Search Controls  -->
    <div class="container-md cont-nav">
        <div class="row">
            <div class="col-sm-2">
                <div class="input-group input-group-sm mb-3">
                    <div class="input-group-prepend">
                        <label class="input-group-text" for="case-study-select">Case Study</label>
                    </div>
                    <select class="custom-select custom-select-sm ID_case-study-select">
                        <!-- Fill in from data in TS now -->
                    </select>
                </div>
            </div>

            <div class="col-sm-2">
                <div class="input-group input-group-sm mb-3">
                    <div class="input-group-prepend">
                        <label class="input-group-text" for="scorefn-select">Score</label>
                    </div>
                    <select class="custom-select custom-select-sm ID_scorefn-select">
                        <!-- Fill in from data in TS now -->
                    </select>
                </div>
            </div>

            <div class="col-sm-2">
                <div class="input-group input-group-sm mb-3">
                    <div class="input-group-prepend">
                        <label class="input-group-text" for="sort-by-select">Sort</label>
                    </div>
                    <select class="custom-select custom-select-sm ID_sort-by-select">
                        <!-- Fill in from data in TS now -->
                    </select>
                </div>
            </div>

            <div class="col-sm-3">
                <div class="input-group input-group-sm mb-3">
                    <div class="input-group-prepend">
                        <label class="input-group-text" for="label-filter">Label</label>
                    </div>
                    <select class="custom-select custom-select-sm ID_label-filter">
                        <!-- Fill in from data in TS now -->
                    </select>
                </div>
            </div>

            <div class="col-sm-3">
                <div class="input-group input-group-sm mb-3">
                    <div class="input-group-prepend">
                        <label class="input-group-text" for="prediction-filter">Prediction</label>
                    </div>
                    <select class="custom-select custom-select-sm ID_prediction-filter">
                        <!-- Fill in from data in TS now -->
                    </select>
                </div>
            </div>

        </div>
    </div>

    <!--  Saliency Image Grid  -->
    <div class="ID_main">
        <div class="ID_sidebar"></div>
        <div class="ID_mainpage">
            <div class="ID_images-panel"></div>
        </div>

    </div>
    `

    base.html(html)
}

/**
 * Main functionality in the below function
 */
export function main(el: Element, ignoreUrl: boolean = false, stateParams: Partial<URLParameters> = {}, freezeParams: boolean = false, noSidebar: boolean=false) {
    const base = d3.select(el)

    const eventHandler = new SimpleEventHandler(el)
    const api = new API()
    const state = new State(ignoreUrl, stateParams, freezeParams)

    init(base)

    const selectors = {
        body: d3.select('body'),
        main: base.select('.ID_main').classed("short-height-main", noSidebar),
        mainPage: base.select('.ID_mainpage').classed("short-height-main", noSidebar),
        imagesPanel: base.select('.ID_images-panel').classed("full-width-images", noSidebar),
        sidebar: base.select('.ID_sidebar').classed("empty-sidebar", noSidebar),
        caseStudy: base.select('.ID_case-study-select'),
        caseStudyListOptions: base.select('.ID_case-study-select').selectAll('option')
            .data(caseStudyOptions)
            .join('option')
            .attr('value', option => option.value)
            .attr('disabled', state.isFrozen('caseStudy'))
            .text(option => option.name),
        scoreFn: base.select('.ID_scorefn-select'),
        scoreFnListOptions: base.select('.ID_scorefn-select').selectAll('option')
            .data(scoreFnOptions)
            .join('option')
            .attr('value', option => option.value)
            .attr('disabled', state.isFrozen('scoreFn'))
            .text(option => option.name),
        sortBy: base.select('.ID_sort-by-select'),
        sortByListOptions: base.select('.ID_sort-by-select').selectAll('option')
            .data(sortByOptions)
            .join('option')
            .attr('value', option => option.value)
            .attr('disabled', state.isFrozen('sortBy'))
            .text(option => option.name),
        predictionFn: base.select('.ID_prediction-filter'),
        predictionFnListOptions: base.select('.ID_prediction-filter').selectAll('option')
            .data(predictionFnOptions)
            .join('option')
            .attr('value', option => option.value)
            .attr('disabled', state.isFrozen('predictionFn'))
            .text(option => option.name),
        labelFilter: base.select('.ID_label-filter'),
        labelFilterListOptions: base.select('.ID_label-filter').selectAll('option')
            .data(labelFilterOptions)
            .join('option')
            .attr('value', option => option.value)
            .attr('disabled', state.isFrozen('labelFilter'))
            .text(option => option.name),
    }

    const vizs = {
        histogram: noSidebar ? null : new Histogram(<HTMLElement>selectors.sidebar.node(), eventHandler),
        confusionMatrix: noSidebar ? null : new ConfusionMatrix(<HTMLElement>selectors.sidebar.node(), eventHandler),
        saliencyImages: new LazySaliencyImages(<HTMLElement>selectors.imagesPanel.node(), eventHandler),
    }

    const eventHelpers = {
        updateImages: (state: State) => {
            vizs.saliencyImages.clear()
            const imageIDs = api.getImages(state.caseStudy(), state.sortBy(), state.predictionFn(), state.scoreFn(),
                state.labelFilter())
            imageIDs.then(IDs => {
                const imgData = {
                    caseStudy: state.caseStudy(),
                    imgIDs: IDs,
                    scoreFn: state.scoreFn()
                }
                vizs.saliencyImages.update(imgData)
            })
        },

        updatePage: (state: State) => {
            vizs.saliencyImages.clear()
            const imageIDs = api.getImages(state.caseStudy(), state.sortBy(), state.predictionFn(), state.scoreFn(),
                state.labelFilter())
            selectors.body.style('cursor', 'progress')
            imageIDs.then(IDs => {
                vizs.saliencyImages.update({ caseStudy: state.caseStudy(), imgIDs: IDs, scoreFn: state.scoreFn() })

                // Update histogram
                api.binScores(state.caseStudy(), IDs, state.scoreFn()).then(bins => {
                    noSidebar || vizs.histogram.update(bins)
                })

                // Update confusion matrix
                const confusionMatrix = api.getConfusionMatrix(state.caseStudy(), state.labelFilter(), state.scoreFn())
                confusionMatrix.then(matrix => {
                    noSidebar ||vizs.confusionMatrix.update(matrix)
                })

                // Finished async calls
                selectors.body.style('cursor', 'default')

            })
        },

        updateLabels: (state: State) => {
            api.getLabels(state.caseStudy()).then(labels => {
                const labelValues = labels.slice();
                labels.splice.apply(labels, [0, 0 as string | number].concat(labelFilterOptions.map(option => option.name)));
                labelValues.splice.apply(labelValues, [0, 0 as string | number].concat(labelFilterOptions.map(option => option.value)));
                selectors.labelFilter.selectAll('option')
                    .data(labels)
                    .join('option')
                    .attr('value', (label, i) => labelValues[i])
                    .attr('disabled', state.isFrozen('labelFilter'))
                    .text(label => label)
                selectors.labelFilter.property('value', state.labelFilter())
            })
        },

        updatePredictions: (state: State) => {
            api.getPredictions(state.caseStudy()).then(predictions => {
                const predictionValues = predictions.slice();
                predictions.splice.apply(predictions, [0, 0 as string | number].concat(predictionFnOptions.map(option => option.name)));
                predictionValues.splice.apply(predictionValues, [0, 0 as string | number].concat(predictionFnOptions.map(option => option.value)));
                selectors.predictionFn.selectAll('option')
                    .data(predictions)
                    .join('option')
                    .attr('value', (prediction, i) => predictionValues[i])
                    .attr('disabled', state.isFrozen('predictionFn'))
                    .text(prediction => prediction)
                selectors.predictionFn.property('value', state.predictionFn())
            })
        }

    }

    /**
     * Initialize the application from the state
     *
     * @param state the state of the application
     */
    async function initializeFromState(state: State) {
        // Fill in label and prediction options
        eventHelpers.updateLabels(state)
        eventHelpers.updatePredictions(state)

        // Set frontend via state parameters
        selectors.caseStudy.property('value', state.caseStudy())
        selectors.sortBy.property('value', state.sortBy())
        selectors.scoreFn.property('value', state.scoreFn())

        // Get data from state parameters
        eventHelpers.updatePage(state)
    }

    initializeFromState(state)

    /**
     * Binding the event handler
    */
    selectors.caseStudy.on('change', () => {
        const caseStudy = selectors.caseStudy.property('value')
        state.caseStudy(caseStudy)
        state.labelFilter('')
        eventHelpers.updateLabels(state)
        state.predictionFn('all_images')
        eventHelpers.updatePredictions(state)
        eventHelpers.updatePage(state)
    });

    selectors.sortBy.on('change', () => {
        const sortByValue = selectors.sortBy.property('value')
        state.sortBy(sortByValue)
        eventHelpers.updateImages(state)
    });

    selectors.predictionFn.on('change', () => {
        const predictionValue = selectors.predictionFn.property('value')
        state.predictionFn(predictionValue)
        eventHelpers.updatePage(state)
    });

    selectors.scoreFn.on('change', () => {
        const scoreValue = selectors.scoreFn.property('value')
        state.scoreFn(scoreValue)
        eventHelpers.updatePage(state)
    });

    selectors.labelFilter.on('change', () => {
        const labelFilter = selectors.labelFilter.property('value')
        state.labelFilter(labelFilter)
        eventHelpers.updatePage(state)
    });

    eventHandler.bind(LazySaliencyImages.events.onScreen, ({ el, id, scoreFn, caseStudy, caller }) => {
        const img = new SingleSaliencyImage(el, eventHandler)
        api.getSaliencyImage(caseStudy, id, scoreFn).then(salImg => {
            img.update(salImg)
        })
    })

    eventHandler.bind(SingleSaliencyImage.events.onScoreHover, ({ score, caller }) => {
        // Put Logic for showing on histogram here
    })

    eventHandler.bind(SingleSaliencyImage.events.onPredictionHover, ({ prediction, caller }) => {
        // Put logic for highlighting row on confusion matrix if exists (low prio)
    })

    eventHandler.bind(SingleSaliencyImage.events.onLabelHover, ({ label, caller }) => {
        // Put logic for highlighting col on confusion matrix if exists (low prio)
    })

    eventHandler.bind(SingleSaliencyImage.events.onLabelClick, ({ label, caller }) => {
        if (!state.isFrozen('labelFilter')) {
            selectors.labelFilter.property('value', label)
            state.labelFilter(label)
            eventHelpers.updatePage(state)
        }
    })

    eventHandler.bind(SingleSaliencyImage.events.onPredictionClick, ({ prediction, caller }) => {
        if (!state.isFrozen('predictionFn')) {
            selectors.predictionFn.property('value', prediction)
            state.predictionFn(prediction)
            eventHelpers.updatePage(state)
        }
    })

}