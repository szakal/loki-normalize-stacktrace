// ==UserScript==
// @name         Grafana Loki Log Formatter with Original Stacktrace Preservation
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Add a button to normalize stack traces in Grafana Loki with original stacktrace preservation
// @author       Your Name
// @match        */grafana/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log("Tampermonkey script started: Grafana Loki Log Formatter with Original Stacktrace Preservation");

    // Function to format stack traces with HTML <br> and indentation
    function formatStackTrace(stackTrace) {
        return stackTrace
            .replace(/\\n/g, '<br>')  // Replace \n with <br> for newlines in HTML
            .replace(/\\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');  // Replace \t with HTML spaces for indentation
    }

    // Function to format the JSON message
    function formatLogMessage(logMessage) {
        try {
            const parsedMessage = JSON.parse(logMessage);

            // Format the stack_trace field if it exists
            if (parsedMessage.stack_trace) {
                parsedMessage.stack_trace = formatStackTrace(parsedMessage.stack_trace);
            }

            return JSON.stringify(parsedMessage, null, 4); // Pretty-print the JSON
        } catch (e) {
            console.error("Failed to parse log message:", logMessage, e);
            return logMessage; // If parsing fails, return the original message
        }
    }

    // Function to normalize all stack traces on the page
    function normalizeStackTraces() {
        console.log("Normalizing stack traces...");
        const logElements = document.querySelectorAll('td[class*="-logs-row__message"]');

        logElements.forEach(function(element) {
            // Use the original log message (unformatted) if available
            let originalMessage = element.getAttribute('data-original-message');
            if (!originalMessage) {
                // Store the original message if it hasn't been stored yet
                originalMessage = element.textContent;
                element.setAttribute('data-original-message', originalMessage);
            }

            console.log("Original log message:", originalMessage);

            // Format the log message
            const formattedMessage = formatLogMessage(originalMessage);

            // Replace the textContent with formatted HTML (including newlines and indentation)
            element.innerHTML = formattedMessage
                .replace(/\\n/g, '<br>')    // Ensure newlines are properly displayed
                .replace(/\\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');  // Indent tabs with spaces
        });

        console.log("Stack traces normalized.");
    }

    // Function to add a "Normalize Stacktraces" button to the UI
    function addNormalizeButton() {
        const inlineFieldRow = document.querySelector('div[class*="-InlineFieldRow"]');
        if (!inlineFieldRow) {
            console.error("Failed to find div[class*='-InlineFieldRow'] element.");
            return;
        }

        // Create the button element
        const button = document.createElement('button');
        button.innerText = "Normalize Stacktraces";
        button.style.marginLeft = '10px';  // Adjust button styling if needed

        // Add click event to normalize stack traces
        button.addEventListener('click', function() {
            normalizeStackTraces();
        });

        // Append the button to the UI
        inlineFieldRow.appendChild(button);
        console.log("Normalize Stacktraces button added to the UI.");
    }

    // Poll for the element and add the button when found
    function pollForElement() {
        const interval = setInterval(() => {
            const inlineFieldRow = document.querySelector('div[class*="-InlineFieldRow"]');
            if (inlineFieldRow) {
                clearInterval(interval);  // Stop checking once the element is found
                addNormalizeButton();  // Add the button when the element is available
            } else {
                console.log("Still waiting for div[class*='-InlineFieldRow'] element...");
            }
        }, 1000);  // Check every 1 second
    }

    // Start polling immediately when the script runs
    pollForElement();

})();
