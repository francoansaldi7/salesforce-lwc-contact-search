// Core LWC imports
// LightningElement: base class for every LWC
// api: makes a property public (can be set by a parent component)
// wire: connects the component to Salesforce data (Apex, LDS, etc.)
import { LightningElement, api, wire } from 'lwc';

// Import Apex method used to fetch Contact preview data
import getContactPreview
    from '@salesforce/apex/ContactPreviewController.getContactPreview';

// NavigationMixin allows navigation to standard Salesforce pages
import { NavigationMixin } from 'lightning/navigation';

// Import different HTML templates for conditional rendering
import emptyTemplate from './contactPreviewEmpty.html';
import loadingTemplate from './contactPreviewLoading.html';
import previewTemplate from './contactPreviewView.html';
import errorTemplate from './contactPreviewError.html';

/**
 * This component displays a preview of a Contact record.
 * It reacts to changes in `contactId`, fetches data from Apex,
 * and renders different templates depending on the state:
 * - Empty
 * - Loading
 * - Error
 * - Preview
 */
export default class ContactPreview extends NavigationMixin(LightningElement) {

    // Private variable to store the Contact Id
    _contactId;

    // Holds the Contact record returned from Apex
    contact;

    // Holds error information (if something goes wrong)
    error;

    // Controls the loading state of the component
    isLoading = false;

    /**
     * This setter is called automatically whenever the parent
     * component passes or updates the contactId.
     *
     * When the contactId changes:
     * 1. We store the new value
     * 2. We activate the loading state
     *
     * This change also triggers the @wire method.
     */
    @api
    set contactId(value) {
        this._contactId = value;
        this.isLoading = true;
    }

    /**
     * Getter for contactId
     *
     * Allows the component to internally access the
     * currently selected Contact Id.
     */
    get contactId() {
        return this._contactId;
    }

    /**
     * This wire method:
     * - Automatically calls Apex when `_contactId` changes
     * - Is reactive due to the `$` symbol
     * - Receives either `data` or `error`
     *
     * It runs:
     * - On component load (if contactId exists)
     * - Every time contactId changes
     */
    @wire(getContactPreview, { contactId: '$_contactId' })
    wiredContact({ data, error }) {

        // Stop the loading state once Apex responds
        this.isLoading = false;

        if (data) {
            // Successful response
            this.contact = data;
            this.error = undefined;
        } else if (error) {
            // Error response
            this.error = error;
            this.contact = undefined;
        }
    }

    /**
     * Lifecycle hook that allows dynamic template selection.
     *
     * This method runs whenever component state changes.
     * It decides which HTML template should be displayed.
     */
    render() {
        if (!this.contactId) return emptyTemplate;
        if (this.isLoading) return loadingTemplate;
        if (this.error) return errorTemplate;
        return previewTemplate;
    }

    /**
     * Lifecycle hook that runs AFTER the component
     * has finished rendering in the DOM.
     *
     * Use this hook for DOM-related logic.
     */
    renderedCallback() {
        if (this.contact) {
            // Scroll the preview into view smoothly
            this.template.querySelector('.preview')?.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }

    /**
     * Lifecycle hook that catches JavaScript errors
     * thrown anywhere in the component.
     */
    errorCallback(error, stack) {
        this.error = error;
        console.error(error, stack);
    }

    /**
     * Dispatches a custom event to notify the parent component
     * that the preview should be closed.
     */
    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    /**
     * Uses NavigationMixin to navigate to the standard
     * Salesforce Contact record page.
     *
     * Triggered when the user clicks on the Contact name
     * or a "View Record" button.
     */
    navigateToContact() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.contact.Id,
                objectApiName: 'Contact',
                actionName: 'view'
            }
        });
    }
}