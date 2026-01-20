// Core LWC imports
// LightningElement: base class for all LWCs
// wire: connects the component to Salesforce services
// track: makes properties reactive (mainly for complex state)
import { LightningElement, wire, track } from 'lwc';

// Import Apex method used to search Contacts
import searchContacts
    from '@salesforce/apex/ContactSearchController.searchContacts';

// NavigationMixin allows navigation to standard Salesforce pages
import { NavigationMixin } from 'lightning/navigation';

// Lightning Message Service imports
// publish: sends messages to other components
// MessageContext: required to use LMS
import { publish, MessageContext } from 'lightning/messageService';

// Import the custom Message Channel used for analytics
import CONTACT_SEARCH_CHANNEL
    from '@salesforce/messageChannel/contactSearchMessageChannel__c';

/**
 * This component provides a Contact search experience.
 * It allows users to:
 * - Search Contacts by name or email
 * - Apply "has email" filter
 * - Select a Contact to preview
 * - Publish search analytics via LMS
 */
export default class ContactSearch extends NavigationMixin(LightningElement) {

    // Current text entered in the search input
    @track searchTerm = '';

    // List of Contacts returned from Apex
    @track contacts;

    // Error message to display in the UI
    @track error;

    // Message shown when no results or invalid input
    @track noResultsMessage;

    // Id of the currently selected Contact
    selectedContactId;

    // Filter: only return Contacts with Email
    hasEmail = false;

    // Used to debounce search input
    searchTimeout;

    /**
     * Required by Lightning Message Service.
     * Automatically provided by the framework.
     */
    @wire(MessageContext)
    messageContext;

    // =====================
    // Getters
    // =====================

    /**
     * Returns true if a Contact is selected.
     * Used to conditionally render the preview component.
     */
    get hasSelectedContact() {
        return !!this.selectedContactId;
    }

    /**
     * Controls visibility of the "Clear" button.
     * The button is shown if there are results, errors,
     * or informational messages.
     */
    get showClearButton() {
        return (
            this.contacts?.length > 0 ||
            this.error ||
            this.noResultsMessage
        );
    }

    // =====================
    // Event Handlers
    // =====================

    /**
     * Handles typing in the search input.
     *
     * Uses a debounce technique to prevent calling Apex
     * on every keystroke.
     */
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;

        // Clear any existing timeout
        clearTimeout(this.searchTimeout);

        // Delay execution to improve performance
        this.searchTimeout = setTimeout(() => {
            this.executeSearch();
        }, 400);
    }

    /**
     * Handles click on the Search button.
     * Immediately executes the search.
     */
    handleSearch() {
        this.executeSearch();
    }

    /**
     * Executes the Contact search.
     *
     * This method:
     * 1. Validates input
     * 2. Calls Apex
     * 3. Handles results or errors
     * 4. Publishes search analytics
     */
    executeSearch() {

        // Reset selected Contact when performing a new search
        this.selectedContactId = null;

        // Validate search input
        if (!this.searchTerm) {
            this.contacts = null;
            this.noResultsMessage = 'Please enter a search term.';
            return;
        }

        // Call Apex imperatively
        searchContacts({
            searchTerm: this.searchTerm,
            hasEmail: this.hasEmail,
        })
            .then(result => {
                // Successful response
                this.contacts = result;
                this.error = null;

                // Show message if no records were found
                this.noResultsMessage =
                    result.length === 0
                        ? 'No contacts found matching your search.'
                        : null;

                // Publish search term for analytics or other listeners
                publish(this.messageContext, CONTACT_SEARCH_CHANNEL, {
                    searchTerm: this.searchTerm
                });
            })
            .catch(error => {
                // Handle Apex or network errors
                this.error = error.body?.message;
                this.contacts = null;
                this.noResultsMessage = null;
            });
    }

    /**
     * Handles the "Has Email" checkbox filter.
     * Re-runs the search when toggled.
     */
    handleEmailFilter(event) {
        this.hasEmail = event.target.checked;
        this.executeSearch();
    }

    /**
     * Handles user selecting a Contact from the list.
     * Stores the Contact Id for preview display.
     */
    handleContactSelect(event) {
        this.selectedContactId = event.currentTarget.dataset.id;
    }

    /**
     * Handles the close event from the preview component.
     * Clears the selected Contact.
     */
    handlePreviewClose() {
        this.selectedContactId = null;
    }

    /**
     * Clears all search inputs, filters, results,
     * errors, and selected Contact.
     */
    handleClearSearch() {
        this.searchTerm = '';
        this.contacts = null;
        this.error = null;
        this.noResultsMessage = null;
        this.selectedContactId = null;
        this.hasEmail = false;
    }
}