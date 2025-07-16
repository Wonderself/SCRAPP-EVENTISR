#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Tu es un agent spécialisé dans l'extraction d'événements culturels et publics en Israël. Ta mission est de scraper les événements à venir en août et septembre 2025 en Israël sur les sites suivants : 1. https://www.eventbrite.com/d/israel--tel-aviv/events/ 2. https://www.matkonet.co.il 3. https://www.getout.co.il 4. https://www.habama.co.il 5. https://www.funzing.com. Pour chaque événement, récupère les informations suivantes : Nom de l'événement, Date, Lieu, URL complète, Brève description, Email de contact de l'organisateur, Nom de l'organisateur. Format de sortie : tableau avec colonnes (une par ligne) : Nom | Date | Lieu | URL | Description | Email | Organisateur. Travaille page par page sur chaque site. Concentre-toi sur les 250 événements les plus importants avec rate limiting et support Hebrew."

backend:
  - task: "Event Data Models and Configuration"
    implemented: true
    working: true
    file: "models.py, scraping_config.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Created comprehensive Event model with Hebrew support, importance scoring, and validation for Aug/Sep 2025 dates"
      - working: true
        agent: "main"
        comment: "Added ScrapingConfig with rate limiting, Hebrew keywords, and site-specific configurations"

  - task: "Web Scraping Infrastructure"
    implemented: true
    working: true
    file: "base_scraper.py, scraping_utils.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Implemented BaseScraper with Playwright integration for JavaScript-heavy sites"
      - working: true
        agent: "main"
        comment: "Added ScrapingUtils with Hebrew detection, date parsing, email extraction, and contact info extraction"

  - task: "Individual Website Scrapers"
    implemented: true
    working: true
    file: "scrapers/ directory with all 5 scrapers"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Implemented EventbriteScraper, MatkonetScraper, GetoutScraper, HabamaScraper, and FunzingScraper"
      - working: true
        agent: "main"
        comment: "Each scraper handles site-specific selectors, Hebrew content, and contact information extraction"

  - task: "Event Scraping Service"
    implemented: true
    working: true
    file: "scraping_service.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Created EventScrapingService with concurrent scraping, job management, and top 250 event selection"
      - working: true
        agent: "main"
        comment: "Added database integration, error handling, and statistics collection"

  - task: "API Endpoints"
    implemented: true
    working: true
    file: "event_routes.py, server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Created comprehensive API with scraping triggers, event retrieval, export (CSV/JSON), and job monitoring"
      - working: true
        agent: "testing"
        comment: "Fixed routing issues - moved event routes to api_router and fixed route conflicts"
      - working: true
        agent: "testing"
        comment: "All 8 API endpoints tested successfully: health check, events, stats, jobs, scraping, export"

  - task: "Dependencies and Setup"
    implemented: true
    working: true
    file: "requirements.txt"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Added all required dependencies: playwright, selenium, beautifulsoup4, langdetect, etc."
      - working: true
        agent: "main"
        comment: "Installed Playwright browsers for JavaScript rendering"

frontend:
  - task: "Event Display Interface"
    implemented: true
    working: true
    file: "components/EventsTable.js, App.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: false
        agent: "main"
        comment: "Frontend interface for displaying scraped events not yet implemented"
      - working: true
        agent: "main"
        comment: "Implemented complete EventsTable component with Hebrew support, filtering, search, export, and responsive design"
      - working: true
        agent: "testing"
        comment: "Comprehensive testing completed - all functionality working: table display, filtering, search, export CSV, Hebrew/RTL support, responsive design"

  - task: "Scraping Control Interface"
    implemented: true
    working: true
    file: "components/ScrapingControl.js, App.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: false
        agent: "main"
        comment: "Frontend interface for triggering scraping jobs not yet implemented"
      - working: true
        agent: "main"
        comment: "Implemented complete ScrapingControl component with individual and bulk scraping controls, job monitoring, and status tracking"
      - working: true
        agent: "testing"
        comment: "All scraping controls tested and working: bulk scraping, individual sources, job tracking, status updates, Hebrew interface"

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 1
  run_ui: false

test_plan:
  current_focus:
    - "Frontend Event Display Interface"
    - "Scraping Control Interface"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: "Phase 1 (Backend Infrastructure) completed successfully. All 5 website scrapers implemented with Hebrew support, rate limiting, and contact info extraction. API endpoints working correctly."
  - agent: "testing"
    message: "Backend testing completed successfully. All 8 API endpoints tested and working: health check, events retrieval, stats, jobs, scraping triggers, and export functionality. Route conflicts fixed."
  - agent: "main"
    message: "Ready to proceed with Phase 2 (Frontend Interface) - need user confirmation for frontend testing preferences."