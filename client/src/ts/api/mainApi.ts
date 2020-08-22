import * as d3 from 'd3';
import { makeUrl, toPayload } from '../etc/apiHelpers'
import { URLHandler } from '../etc/URLHandler';
import { SaliencyImg } from '../types';


const baseurl = URLHandler.basicURL()


export class API {

    constructor(private baseURL: string = null) {
        if (this.baseURL == null) {
            this.baseURL = baseurl + '/api';
        }
    }


    /**
     * Get the saliency image objects for all imageIDs.
     *
     * @imageIDs: list of string image ids to get saliency image objects for
     * @scoreFn: string score function name
     */
    getSaliencyImages(imageIDs: string[], scoreFn: string): Promise<SaliencyImg[]> {
        const imagesToSend = {
            imageIDs: imageIDs,
            scoreFn: scoreFn
        }
        const url = makeUrl(this.baseURL + "/get-saliency-images")
        const payload = toPayload(imagesToSend)
        return d3.json(url, payload)
    }


    /**
     * Get image IDs
     */
    getImages(sortBy: number, predictionFn: string, scoreFn: string, labelFilter: string): Promise<string[]> {
        const toSend = {
            sortBy: sortBy,
            predictionFn: predictionFn,
            scoreFn: scoreFn,
            labelFilter: labelFilter,
        }
        const url = makeUrl(this.baseURL + "/get-images", toSend)
        return d3.json(url)
    }

    /**
     * Get all dataset predictions
     */
    getPredictions(): Promise<string[]> {
        const toSend = {}
        const url = makeUrl(this.baseURL + "/get-predictions", toSend)
        return d3.json(url)
    }

    /**
     * Get all dataset labels
     */
    getLabels(): Promise<string[]> {
        const toSend = {}
        const url = makeUrl(this.baseURL + "/get-labels", toSend)
        return d3.json(url)
    }


};
