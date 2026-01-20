// Core LWC imports
// LightningElement: base class for all Lightning Web Components
// wire: connects the component to Salesforce services
import { LightningElement, wire } from 'lwc';

// Lightning Message Service imports
// subscribe: listens to messages published on a channel
// MessageContext: required for LMS usage
import { subscribe, MessageContext } from 'lightning/messageService';

// Import the custom Message Channel used for Contact search events
import CONTACT_SEARCH_CHANNEL
    from '@salesforce/messageChannel/contactSearchMessageChannel__c';

// Import Apex method used to persist analytics data
import saveAnalytics
    from '@salesforce/apex/ContactSearchAnalyticsController.saveAnalytics';

/**
 * This component listens for Contact search events using
 * Lightning Message Service and tracks analytics for the session.
 *
 * It records:
 * - Number of searches
 * - Last search term
 * - Session duration
 * - Error information
 *
 * When the component is removed from the DOM, it saves
 * all collected analytics to Salesforce.
 */
export default class ContactSearchAnalytics extends LightningElement {

    // Total number of searches performed during the session
    searchCount = 0;

    // Most recent search term received via LMS
    lastSearchTerm = '—';

    // Timestamp when the analytics session started
    sessionStartTime = Date.now();

    // Tracks whether a JS error occurred during the session
    hasError = false;

    // Stores the error message (if any)
    errorMessage = '';

    // Used to prevent logic from running multiple times
    // inside renderedCallback
    hasRendered = false;

    // Holds the LMS subscription reference
    subscription;

    /**
     * Automatically provided by the framework.
     * Required to subscribe to a Lightning Message Channel.
     */
    @wire(MessageContext)
    messageContext;

    /**
     * Called when the component instance is created.
     * Used for basic initialization only.
     *
     * NOTE: Avoid DOM access here.
     */
    constructor() {
        super();
        console.log('Analytics initialized');
    }

    /**
     * Lifecycle hook that runs when the component
     * is inserted into the DOM.
     *
     * Ideal place to:
     * - Set up subscriptions
     * - Initialize listeners
     */
    connectedCallback() {
        this.subscribeToChannel();
    }

    /**
     * Subscribes to the Contact Search message channel.
     *
     * Ensures the component listens only once
     * to avoid duplicate analytics events.
     */
    subscribeToChannel() {
        if (this.subscription) return;

        this.subscription = subscribe(
            this.messageContext,
            CONTACT_SEARCH_CHANNEL,
            (message) => this.handleSearchMessage(message)
        );
    }

    /**
     * Handles incoming messages from the message channel.
     *
     * Each message represents a Contact search event.
     * Updates the search count and last search term.
     */
    handleSearchMessage(message) {
        this.searchCount++;
        this.lastSearchTerm = message.searchTerm;
    }

    /**
     * Lifecycle hook that runs after every render.
     *
     * The `hasRendered` flag ensures that logic
     * inside this hook runs only once.
     */
    renderedCallback() {
        if (this.hasRendered) return;
        this.hasRendered = true;
    }

    /**
     * Lifecycle hook that runs when the component
     * is removed from the DOM.
     *
     * Used here to persist analytics data before
     * the component is destroyed.
     */
    disconnectedCallback() {
        this.saveSessionAnalytics();
    }

    /**
     * Lifecycle hook that catches JavaScript errors
     * thrown inside the component.
     *
     * Stores error information to be included
     * in analytics data.
     */
    errorCallback(error, stack) {
        this.hasError = true;
        this.errorMessage = error?.message;
    }

    /**
     * Saves the analytics data to Salesforce.
     *
     * Calculates the session duration and calls
     * an Apex method to persist the data.
     *
     * Errors are silently ignored to avoid
     * affecting the user experience.
     */
    saveSessionAnalytics() {

        // Calculate session duration in seconds
        const duration = Math.floor(
            (Date.now() - this.sessionStartTime) / 1000
        );

        // Call Apex to save analytics
        saveAnalytics({
            searchCount: this.searchCount,
            lastSearchTerm: this.lastSearchTerm,
            sessionDuration: duration,
            hasError: this.hasError,
            errorMessage: this.errorMessage
        }).catch(() => {});
    }

    /**
     * Returns the current session duration in seconds.
     * Can be used for real-time display in the UI.
     */
    get sessionTime() {
        return Math.floor(
            (Date.now() - this.sessionStartTime) / 1000
        );
    }
}