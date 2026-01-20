/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 01-20-2026
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/

/**
 * This controller handles **searching Contacts dynamically**
 * based on user input from the frontend.
 *
 * It supports filtering by:
 * - Search term (Name or Email)
 * - Whether the Contact must have an Email
 *
 * The method is cacheable to improve performance.
 */

/**
    * Searches Contacts using dynamic filters.
    *
    * @param searchTerm  - Text entered by the user (required)
    * @param hasEmail   - If true, only Contacts with Email are returned
    * @param accountName - Optional Account Name filter
    * @return List<Contact> - Matching Contacts
    *
    * This method:
    * 1. Validates the search term.
    * 2. Escapes user input to prevent SOQL injection.
    * 3. Builds a dynamic SOQL query based on filters.
    * 4. Executes the query and returns results.
*/
public with sharing class ContactSearchController {

    @AuraEnabled(cacheable=true)
    public static List<Contact> searchContacts(
        String searchTerm,
        Boolean hasEmail,
        String accountName
    ) {
        // Validate input early
        if (String.isBlank(searchTerm)) {
            return new List<Contact>();
        }

        try {
            String escapedTerm =
                '%' + String.escapeSingleQuotes(searchTerm) + '%';

            String query =
                'SELECT Id, Name, Email ' +
                'FROM Contact ' +
                'WHERE (Name LIKE :escapedTerm OR Email LIKE :escapedTerm)';

            if (hasEmail == true) {
                query += ' AND Email != null';
            }

            if (!String.isBlank(accountName)) {
                String escapedAccount =
                    '%' + String.escapeSingleQuotes(accountName) + '%';
                query += ' AND Account.Name LIKE :escapedAccount';
            }

            query += ' ORDER BY Name';

            return Database.query(query);

        } catch (Exception e) {
            System.debug('Contact search failed: ' + e.getMessage());

            throw new AuraHandledException(
                'Something went wrong while searching contacts. Please try again.'
            );
        }
    }
}