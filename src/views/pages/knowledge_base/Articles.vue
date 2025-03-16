<script setup>
import MarkdownIt from 'markdown-it';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const toast = useToast();
const router = useRouter();
const searchQuery = ref('');
const loading = ref(true);
const selectedCategory = ref(null);
const showArticleDialog = ref(false);
const currentArticle = ref(null);

const categories = ref([
    { id: 1, name: 'Security Protocols', icon: 'pi pi-shield', color: 'bg-blue-100 text-blue-700' },
    { id: 2, name: 'Customer Service', icon: 'pi pi-users', color: 'bg-green-100 text-green-700' },
    { id: 3, name: 'Banking Systems', icon: 'pi pi-server', color: 'bg-purple-100 text-purple-700' }
]);

// Initialize markdown-it without syntax highlighting
const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
});

// The rendering function
const renderMarkdown = (content) => {
    return md.render(content || '');
};

const articles = ref([
    {
        id: 1,
        title: 'Detecting and Preventing Banking Fraud: A Guide for Tellers',
        summary: 'Learn the key warning signs of potential fraud and the proper protocols to follow when suspicious activity is detected.',
        author: 'Sarah Johnson',
        authorRole: 'Security Compliance Officer',
        authorAvatar: 'https://avatar.iran.liara.run/public/50?name=Sarah Johnson',
        categoryId: 1,
        content: `
# Detecting and Preventing Banking Fraud: A Guide for Tellers

## Introduction

Bank tellers are the first line of defense against various types of financial fraud. Your attentiveness and knowledge of fraud indicators can prevent significant losses for both customers and the bank. This guide provides practical tools to help you identify and respond to suspicious activities that may indicate fraud attempts.

## Common Types of Banking Fraud

### 1. Check Fraud

**Warning Signs:**
- Inconsistent signature compared to account signature card
- Missing or faded bank logo/watermark
- Irregular check number sequence
- Poor quality printing or uneven text
- Unusual endorsements
- Customer seems nervous or in a hurry
- Large check amounts for new accounts

**Example Scenario:**
A customer presents a check with a slightly different signature than their signature card. When asked for ID, they become agitated and claim they're in a rush.

**Protocol:**
- Compare signature with signature card
- Examine the check for security features (microprinting, watermarks)
- Verify funds availability through the system
- For suspicious checks over $2,000, consult your supervisor
- Document the interaction in the system notes

### 2. Identity Theft

**Warning Signs:**
- Customer cannot answer basic account verification questions
- Multiple identification documents with inconsistencies
- Customer is overly familiar or attempting to rush the transaction
- Recent changes to account contact information
- Multiple large withdrawals in a short period

**Example Scenario:**
A customer requests a large withdrawal but cannot provide specific account details when asked verification questions.

**Protocol:**
- Request two forms of government-issued ID
- Ask out-of-wallet questions (questions whose answers aren't typically in a wallet)
- For transactions above $5,000, verify with the branch manager
- If fraud is suspected, use code phrase "I need to check with our service department" to alert security discreetly

### 3. Elder Financial Exploitation

**Warning Signs:**
- Elderly customer accompanied by a new "friend" or caregiver
- Sudden changes in banking patterns or large withdrawals
- Confused about transactions they don't recall authorizing
- Signatures that don't match previous signatures
- Third party speaking for the customer and not allowing them to speak

**Example Scenario:**
An elderly customer arrives with a younger individual who attempts to direct the transaction and speaks on behalf of the customer.

**Protocol:**
- Speak directly to the account holder, not the accompanying individual
- Request to speak with the customer privately if possible
- Ask clear questions about the purpose of the withdrawal
- Consult with your supervisor if you suspect exploitation
- Document details of the interaction, including description of all parties present

## Transaction Security Procedures

### Verification Requirements by Transaction Type

| Transaction Type | Amount | ID Required | Additional Verification |
|------------------|--------|------------|-------------------------|
| Cash Withdrawal | $3,000-$10,000 | 2 forms of ID | Account activity review |
| Cash Withdrawal | >$10,000 | 2 forms of ID | Manager approval & CTR filing |
| Check Cashing (Non-customer) | Any amount | 2 forms of ID | Verification call to account holder for checks >$2,000 |
| Wire Transfer | Any amount | 2 forms of ID | Verification call to customer's registered phone number |

### Handling Currency Transaction Reports (CTRs)

Remember that all cash transactions over $10,000 require filing a Currency Transaction Report:

1. Inform the customer that federal regulations require documentation
2. Complete all CTR fields accurately, especially beneficial owner information
3. Never inform a customer if you suspect they're structuring transactions to avoid CTRs
4. File the CTR by the end of the business day

## Responding to Suspected Fraud

### Immediate Actions

If you suspect fraudulent activity:

1. Remain calm and professional
2. Do not directly accuse the customer of fraud
3. Use the designated code phrase to alert your supervisor or security
4. Delay the transaction by saying: "Our system is running slowly today" or "I need additional approval for this transaction"
5. Document all details including physical descriptions and identification presented

### Escalation Procedures

| Fraud Type | First Contact | Secondary Contact | Documentation Required |
|------------|--------------|-------------------|------------------------|
| Check Fraud | Supervisor | Security Officer | Incident Report, Copy of Check |
| Identity Theft | Supervisor | Fraud Department | Incident Report, ID Information |
| Elder Abuse | Supervisor | Elder Protection Officer | Incident Report, Detailed Notes |
| Internal Fraud | Branch Manager | Compliance Hotline | Confidential Report |

## Case Studies: Fraud Detection Success Stories

### Case Study 1: The Careful Teller

A teller noticed unusual activity when a regular customer's account showed three large withdrawals in different branches over two days. When the customer arrived for another withdrawal, the teller asked verification questions and discovered the customer's ATM card had been stolen. The thief had found the PIN written inside the customer's wallet. The teller's attention saved the customer from further losses.

### Case Study 2: The Observant New Hire

A new teller noticed an elderly customer who regularly deposited $900 was accompanied by an unfamiliar caregiver who requested $800 cash back from the deposit. The teller alerted the supervisor, who spoke privately with the customer. It was discovered the caregiver had been taking money from the customer for personal use. The bank's swift action protected the vulnerable customer.

## System Security Best Practices

1. **Never share your credentials** - Each transaction you process is logged under your user ID
2. **Lock your terminal** when stepping away (CTRL+ALT+DEL then Lock or Windows+L)
3. **Position your screen** to prevent customers from viewing account information
4. **Log out completely** at the end of your shift
5. **Change your password** every 60 days and never use the same password twice
6. **Report suspicious emails** to IT immediately without clicking links

## Conclusion

Your role as a teller is crucial in preventing financial fraud. By staying alert to warning signs and following proper protocols, you protect both our customers and the bank. If you're ever unsure about a transaction, it's always better to verify than to process a potentially fraudulent transaction.

Remember: security is everyone's responsibility. Your vigilance makes a difference every day.

## Additional Resources

- Bank Security Portal: [internal.bankportal.com/security](internal.bankportal.com/security)
- Fraud Alert Hotline: x7788
- Compliance Question Email: compliance@bankname.com
`,
        publishedDate: new Date(2025, 2, 5),
        updatedDate: new Date(2025, 2, 5),
        tags: ['fraud prevention', 'security', 'teller procedures', 'compliance'],
        views: 342,
        helpful: 45,
        comments: 8,
        isFeatured: true
    },
    {
        id: 2,
        title: 'Troubleshooting Common Banking System Issues',
        summary: 'A practical guide for bank staff on how to resolve common technical issues with core banking systems, ATMs, and customer-facing applications.',
        author: 'Robert Chen',
        authorRole: 'IT Support Lead',
        authorAvatar: 'https://avatar.iran.liara.run/public/50?name=Robert Chen',
        categoryId: 3,
        content: `
# Troubleshooting Common Banking System Issues

## Introduction

Technical issues with banking systems can disrupt operations and impact customer service. This guide provides step-by-step troubleshooting procedures for common issues that branch staff may encounter with core banking systems, ATMs, and customer-facing applications.

## Core Banking System Issues

### Issue 1: System Slowness or Unresponsiveness

**Symptoms:**
- Transactions take longer than 10 seconds to process
- Screen freezes during customer transactions
- Error messages indicating timeout

**Troubleshooting Steps:**

1. **Check System Status Dashboard**
   - Open the internal portal at http://banknet/systemstatus
   - Verify if there are any announced outages or maintenance
   - If a system-wide issue is reported, inform customers and use backup procedures

2. **Restart the Application**
   - Save any in-progress work if possible
   - Close the application properly through the File > Exit menu
   - Wait 30 seconds
   - Relaunch the application and log in
   - Note: Do not restart the computer unless instructed by IT

3. **Check Network Connectivity**
   - Verify the network icon shows connectivity
   - Run a basic connectivity test by opening http://banknet
   - If network issues are suspected, check if colleagues are experiencing the same problem

4. **Clear Application Cache**
   - Go to Settings > System Maintenance
   - Select "Clear Local Cache"
   - Confirm and wait for completion
   - Restart the application

5. **Contact IT Support**
   - If issues persist, contact IT Support at extension 2255
   - Provide your terminal ID: Found at Settings > System Info
   - Describe the specific transaction that's causing the issue
   - Stay on the line for further troubleshooting

### Issue 2: Printing Problems

**Symptoms:**
- Receipt printer not printing
- Documents printing with errors or missing information
- Paper jams or error lights on the printer

**Troubleshooting Steps:**

1. **Check Physical Connections**
   - Verify power cable is securely connected
   - Check USB/network cable connection to the terminal
   - Ensure the printer is online (green light usually indicates this)

2. **Check Paper and Ink**
   - Open the printer cover to check for paper jams
   - Verify paper is correctly loaded and not empty
   - Check ink or toner levels through the printer's display panel

3. **Restart Printing Services**
   - Go to Settings > Peripherals > Printer
   - Select "Reset Printer Connection"
   - Wait for confirmation message
   - Try printing a test page

4. **Check Printer Queue**
   - Right-click the printer icon in the system tray
   - Select "Open Printer Queue"
   - Cancel any stuck print jobs
   - Try printing again

5. **Run Printer Diagnostic**
   - Go to Settings > Peripherals > Diagnostics
   - Select "Printer Test"
   - Follow on-screen instructions
   - Document any error codes displayed

6. **Printer Replacement Procedure**
   - Contact IT Support for printer replacement if needed
   - Continue operations using the backup printer
   - Transfer to another teller station if necessary

## ATM System Issues

### Issue 1: ATM Out of Service

**Response Protocol:**

1. **Verify the Issue**
   - Check the ATM screen for error messages
   - Verify if the machine is powered on
   - Check for any visible damage or tampering

2. **Check Known Issues Log**
   - Access the ATM Status Portal at http://banknet/atmstatus
   - See if the ATM is already listed as out of service
   - Verify if maintenance is scheduled

3. **Basic Troubleshooting**
   - For card reader errors: Check for visible obstructions in the card slot
   - For receipt printer errors: Verify paper levels through manager access
   - For cash dispenser errors: Do not attempt to open cash compartments

4. **Reporting Procedure**
   - Call the ATM Service Desk at 1-800-555-1234
   - Provide ATM ID (located on the upper right corner of the machine)
   - Describe the error message or malfunction
   - Place an "Out of Order" sign on the ATM
   - Log the issue in the branch incident tracker

5. **Customer Communication**
   - Inform customers of alternative ATM locations
   - Offer to process withdrawals at the teller line
   - Provide estimated resolution time if available from ATM Service Desk

### Issue 2: Customer Card Captured by ATM

**Response Protocol:**

1. **Verify Customer Identity**
   - Request government-issued photo ID
   - Verify the customer's information in the banking system
   - Confirm the card number if possible

2. **Check Card Status**
   - Access Card Management System
   - Verify if the card was captured due to:
     - Repeated incorrect PIN entries
     - Expired card
     - Card reported lost/stolen
     - Fraud prevention measure

3. **Card Retrieval Process**
   - Inform customer that cards captured by ATMs cannot be immediately retrieved
   - Cards are securely retrieved during scheduled ATM servicing
   - Provide timeframe for retrieval (typically 3-5 business days)

4. **Resolution Options**
   - Offer to order a replacement card
   - Provide temporary instant issue card if available at your branch
   - Ensure customer can access funds through alternate means while waiting

5. **Documentation**
   - Complete Card Capture Report in the system
   - Provide reference number to customer
   - Log the incident in daily branch report

## Online and Mobile Banking Issues

### Issue 1: Customer Can't Log In to Digital Banking

**Troubleshooting Steps:**

1. **Verify Enrollment Status**
   - Check if the customer is enrolled in online/mobile banking
   - Verify when they last successfully logged in
   - Check for any notes about recent password resets

2. **Common Login Issues**
   - Account lockout: May occur after 3 failed login attempts
   - Forgotten username: Can be retrieved with proper identification
   - Forgotten password: Can be reset with proper authentication
   - Device not recognized: May trigger additional security verification

3. **Device-Specific Troubleshooting**
   
   **For Mobile App Issues:**
   - Verify app version is current
   - Suggest clearing app cache or reinstalling
   - Check if the device is jailbroken/rooted (this prevents login for security)
   
   **For Website Issues:**
   - Suggest clearing browser cache and cookies
   - Try an alternate browser
   - Check for browser compatibility (IE11 is no longer supported)

4. **Reset Process**
   - Username reminder: Can be sent to registered email/phone
   - Password reset: Must be done by customer through "Forgot Password"
   - Account unlock: Can be done by authenticated customer service request

5. **Escalation Path**
   - For persistent issues, contact Digital Banking Support at extension 2288
   - For potential fraud concerns, follow the security escalation protocol

### Issue 2: Failed Transfers or Payments

**Troubleshooting Steps:**

1. **Identify the Error Type**
   - Timing error: Transfer/payment submitted after cutoff time
   - Insufficient funds: Account lacks funds to complete transaction
   - Limit exceeded: Transaction exceeds daily/monthly limits
   - Payee information error: Incorrect account details for recipient
   - Technical error: System unable to process due to technical issue

2. **Verify Transaction Status**
   - Check Transaction History in the core system
   - Look for pending, failed, or returned status
   - Check error codes for specific reasons

3. **Resolution by Error Type**
   
   **For Timing Errors:**
   - Explain cutoff times (4pm for same-day ACH, etc.)
   - Advise on when transaction will process
   
   **For Insufficient Funds:**
   - Check account balance history
   - Discuss overdraft protection options if appropriate
   - Suggest rescheduling payment when funds are available
   
   **For Limit Errors:**
   - Verify customer's current limits
   - Explain temporary limit increase options
   - Suggest splitting transaction if appropriate
   
   **For Technical Errors:**
   - Check system status for known issues
   - Attempt to reprocess transaction
   - Document error codes for IT Support

4. **Documentation and Follow-up**
   - Document all research steps taken
   - Set a reminder to verify transaction success
   - Provide customer with confirmation or follow-up timeframe

## System Security Incidents

### Phishing Email Reporting

If a staff member or customer reports receiving a suspicious email claiming to be from the bank:

1. **Don't click any links or open attachments**
2. **Forward the email as an attachment to security@bankname.com**
3. **Delete the email from the inbox**
4. **Report to branch manager for awareness**
5. **If links were clicked, contact IT Security immediately at extension 2111**

### Suspicious System Behavior

Signs of potential malware or unauthorized access:

1. **Unexpected pop-ups or strange system behavior**
2. **System running unusually slow**
3. **Unfamiliar programs running or unauthorized access attempts**

**Response Protocol:**
1. **Do not shut down the computer**
2. **Disconnect from the network (unplug network cable if possible)**
3. **Call IT Security immediately at extension 2111**
4. **Document what you were doing when the issue occurred**
5. **Do not discuss the matter with customers or unauthorized personnel**

## Conclusion

Resolving technical issues promptly is essential for maintaining excellent customer service. Remember:

1. **Follow established procedures** to ensure consistency and security
2. **Document troubleshooting steps** taken for future reference
3. **Escalate appropriately** when issues persist
4. **Communicate clearly with customers** about the status of their issues
5. **Stay updated on system changes** through regular training

By following this guide, you can resolve many common issues independently, reducing downtime and improving customer satisfaction.

## Additional Resources

- IT Support Portal: [http://banknet/itsupport](http://banknet/itsupport)
- System Status Page: [http://banknet/systemstatus](http://banknet/systemstatus)
- Knowledge Base: [http://banknet/kb](http://banknet/kb)
- IT Support Hotline: Extension 2255
- Security Incident Reporting: Extension 2111
`,
        publishedDate: new Date(2025, 0, 18),
        updatedDate: new Date(2025, 1, 22),
        tags: ['IT support', 'troubleshooting', 'banking systems', 'ATM', 'online banking'],
        views: 287,
        helpful: 51,
        comments: 12,
        isFeatured: true
    },
    {
        id: 3,
        title: 'Effective Customer Service Techniques for Banking Professionals',
        summary: 'Learn proven strategies for handling challenging customer interactions, resolving complaints, and delivering exceptional service in a banking environment.',
        author: 'Maria Rodriguez',
        authorRole: 'Customer Experience Manager',
        authorAvatar: 'https://avatar.iran.liara.run/public/50?name=Maria Rodriguez',
        categoryId: 2,
        content: `
# Effective Customer Service Techniques for Banking Professionals

## Introduction

In banking, exceptional customer service isn't just about being friendly—it's about building trust, resolving issues efficiently, and creating positive experiences that strengthen customer relationships. This guide provides practical techniques for handling common customer service scenarios in a banking environment.

## Communication Fundamentals

### The HEAR Framework for Banking Interactions

Every customer interaction should follow the HEAR framework:

**H - Hear:** Listen actively to understand the customer's needs and concerns.
**E - Empathize:** Acknowledge the customer's feelings and perspective.
**A - Act:** Take appropriate action to address the concern.
**R - Resolve:** Confirm the issue is resolved to the customer's satisfaction.

### Communication Dos and Don'ts

| Do | Don't |
|----|-------|
| Use the customer's name | Use banking jargon or technical terms |
| Maintain appropriate eye contact | Interrupt the customer |
| Speak clearly and at a moderate pace | Make promises you can't keep |
| Focus completely on the current customer | Discuss confidential information in public areas |
| Thank the customer for their business | Blame other departments or colleagues |

### Effective Language Choices

**Positive Language Transformation:**

| Instead of... | Try... |
|--------------|---------|
| "I can't help with that" | "While I can't directly handle that, I can connect you with someone who can" |
| "That's against our policy" | "Our policy requires... Let me explain the options available to you" |
| "You need to..." | "I recommend..." or "The next step would be..." |
| "You have to fill out this form" | "To process your request, I'll help you complete this form" |
| "I don't know" | "That's a good question. Let me find out for you" |

## Handling Specific Banking Scenarios

### 1. Account Fee Complaints

**Customer scenario:** "Why was I charged this fee? I want it reversed immediately!"

**Approach:**
1. **Listen completely** to understand which fee is being disputed
2. **Acknowledge** the customer's frustration: "I understand why this fee is concerning"
3. **Explain** the fee clearly: "This is a monthly maintenance fee that applies when..."
4. **Explore solutions:**
   - Check if the customer qualifies for fee waivers
   - Explain how to avoid the fee in the future
   - Consider a one-time courtesy reversal if appropriate
5. **Document** the conversation and any actions taken

**Sample language:**
"I understand your concern about this fee, Mr. Johnson. Let me explain what this charge is and then we'll discuss some options. This is a monthly maintenance fee that applies when the average daily balance falls below $1,500. Looking at your account history, I see your balance was $1,200 last month. I can show you some ways to avoid this fee in the future, such as setting up direct deposit or linking accounts. As a valued customer, I'd also be happy to process a one-time courtesy reversal of this fee today."

### 2. Wait Time Complaints

**Customer scenario:** "I've been waiting for 20 minutes! This is ridiculous!"

**Approach:**
1. **Apologize sincerely** for the wait time
2. **Explain** (but don't excuse) the situation
3. **Show appreciation** for their patience
4. **Focus forward** on helping them right away
5. **Consider service recovery** options if appropriate

**Sample language:**
"I sincerely apologize for the long wait today, Ms. Garcia. We're experiencing higher than normal volume due to the holiday weekend. I really appreciate your patience. I'm ready to help you right now, and I'll make sure we take care of your needs as efficiently as possible. What brings you in today?"

### 3. Declined Loan Applications

**Customer scenario:** "What do you mean my loan was declined? I've been a customer for years!"

**Approach:**
1. **Move to a private area** for the conversation
2. **Listen** to the customer's concerns
3. **Express empathy** without overpromising
4. **Explain** the decision process generally (without promising specific reasons)
5. **Offer alternatives** and next steps
6. **Maintain relationship** focus

**Sample language:**
"I understand this is disappointing news, Mr. Williams. Let's discuss this in my office where we can have more privacy. While I can't discuss the specific details of the underwriting decision, I can tell you that loan decisions are based on multiple factors including credit history, debt-to-income ratio, and current lending guidelines. What I can do is discuss some alternatives that might better fit your situation right now, such as a secured loan option or steps to strengthen your application for the future. I'm committed to finding the best solution for your financial needs."

### 4. Digital Banking Setup Assistance

**Customer scenario:** "I don't understand this online banking thing. It's too complicated."

**Approach:**
1. **Assess** digital comfort level
2. **Reassure** that learning new systems takes time
3. **Demonstrate** one step at a time
4. **Guide practice** with the customer taking action
5. **Provide** reference materials
6. **Offer** follow-up assistance

**Sample language:**
"I completely understand that new technology can be challenging, Mrs. Thompson. Many customers initially feel the same way, but once they get comfortable with it, they find it saves them a lot of time. Let me show you how it works, starting with just the basics. I'll go slowly, and you can ask questions at any point. Would you like to try logging in while I guide you through the steps? I also have a quick reference guide you can take home, and you're welcome to call me directly if you have questions when you try it on your own."

## De-escalation Techniques for Difficult Situations

### Recognizing Escalation Signals

Watch for these signs that a customer is becoming upset:
- Raised voice or changed tone
- Tense body language
- Repeated statements or questions
- Expression of feeling ignored
- Statements like "I want to speak to a manager"

### The CALM Method for De-escalation

**C - Control your reactions**
- Maintain a calm, professional demeanor
- Take a deep breath if needed
- Keep your voice steady and at a normal volume

**A - Acknowledge the concern**
- "I understand this is frustrating"
- "I can see why this would be concerning"
- "You have every right to be upset about this"

**L - Listen actively**
- Let the customer fully express their concern
- Take notes if appropriate
- Paraphrase to confirm understanding

**M - Manage toward resolution**
- Clearly explain next steps
- Set realistic expectations
- Follow through on commitments

### When to Involve a Manager

Escalate to a manager when:
- The customer specifically requests a manager
- You've exhausted your authority to resolve the issue
- The customer remains highly agitated after de-escalation attempts
- The situation involves a complaint about another employee
- The customer threatens legal action

**Proper escalation language:**
"I want to ensure you receive the best possible assistance with this matter. My manager has additional resources and authority that may help resolve your concern. With your permission, I'd like to bring them into our conversation. May I do that for you?"

## Service Recovery

### The LAST Model for Service Recovery

When a service failure occurs, use the LAST approach:

**L - Listen** completely to the customer's experience
**A - Apologize** sincerely for the inconvenience or error
**S - Solve** the problem completely
**T - Thank** the customer for their patience and feedback

### Appropriate Service Recovery Options

| Situation | Potential Recovery Action |
|-----------|---------------------------|
| Extended wait time | Express service for next visit |
| Transaction error | Fee waiver and clear explanation |
| Repeated issue | Follow-up call from manager |
| Significant inconvenience | Small gesture (promotional item, handwritten note) |
| Major service failure | Account credit or enhanced service offering |

**Remember:** Document all service recovery actions in the customer's profile for future reference.

## Building Long-term Relationships

### The Moments of Truth Concept

In banking, these key "moments of truth" shape customer perception:
- Account opening process
- Problem resolution experiences
- Loan application and approval
- Financial hardship interactions
- Digital banking enrollment and usage
- Security concern handling

Exceptional service during these critical moments has disproportionate impact on customer loyalty.

### Proactive Relationship Building

1. **Personalized follow-up:**
   - "I noticed you recently opened a savings account. How is that working for your goals?"
   - "I wanted to check that your new debit card arrived and is working properly"

2. **Financial education offerings:**
   - Invite customers to relevant workshops
   - Share resources that match their life stage
   - Provide timely information about new services

3. **Anticipate life changes:**
   - New address may indicate home purchase opportunity
   - College-age children may signal education funding needs
   - Approaching retirement may indicate shifting financial priorities

### Documentation Best Practices

Thorough documentation in customer profiles ensures consistent service:

- Record customer preferences (communication method, financial goals)
- Note special circumstances or accommodations
- Document resolution of past issues
- Include relevant personal details (e.g., "Customer mentioned upcoming retirement")
- Update contact information at every interaction

## Remote and Digital Customer Service

### Phone Service Excellence

1. **Proper greeting:**
   "Thank you for calling [Bank Name]. This is [Your Name]. How may I help you today?"

2. **Identity verification process:**
   - Explain the need for security questions
   - Verify at least two factors before discussing account details
   - Thank the customer for their cooperation with security procedures

3. **Active listening cues:**
   - Use verbal acknowledgments: "I understand," "I see," "I appreciate you explaining that"
   - Summarize periodically: "So far, I understand that..."
   - Ask clarifying questions when needed

4. **Clear closings:**
   - Summarize actions taken
   - Explain next steps
   - Provide a reference number for the interaction
   - Thank the customer by name

### Digital Channel Support

1. **Chat support best practices:**
   - Respond within 30 seconds of chat initiation
   - Use proper grammar and spelling
   - Avoid excessive use of scripts or canned responses
   - Check understanding before ending the conversation

2. **Email response guidelines:**
   - Respond within one business day
   - Address the specific question asked
   - Include clear next steps and contact information
   - Use the bank's standard email template

3. **Social media engagement:**
   - Never discuss account specifics on public channels
   - Move detailed conversations to private message
   - Acknowledge public complaints promptly
   - Follow up to ensure resolution

## Measuring and Improving Your Service

### Key Performance Indicators

Track your service performance using these metrics:
- Customer satisfaction scores from surveys
- Resolution time for customer issues
- First-call resolution rate
- Referrals from existing customers
- Feedback from mystery shopper programs

### Self-Improvement Techniques

1. **Regular role-playing** with colleagues
2. **Service journal** to record successful interactions
3. **Peer observation** and feedback
4. **Continuous product knowledge** updates
5. **Customer service skill workshops**

## Conclusion

Exceptional customer service in banking is both an art and a science. By mastering these techniques, you'll not only resolve customer issues effectively but also build lasting relationships that drive loyalty and growth. Remember that every interaction is an opportunity to demonstrate the value we place on our customers and to distinguish our bank through service excellence.

## Additional Resources

- Customer Service Portal: [http://banknet/customerservice](http://banknet/customerservice)
- Product Training Modules: [http://banknet/training](http://banknet/training)
- Service Recovery Guidelines: [http://banknet/servicerecovery](http://banknet/servicerecovery)
`,
        publishedDate: new Date(2024, 11, 12),
        updatedDate: new Date(2025, 0, 5),
        tags: ['customer service', 'communication', 'complaint handling', 'client relations'],
        views: 215,
        helpful: 32,
        comments: 4,
        isFeatured: false
    }
]);

// New article form (simplified)
const newArticle = ref({
    title: '',
    content: '',
    categoryId: null,
    tags: []
});

// Computed properties
const filteredArticles = computed(() => {
    let result = articles.value;

    // Filter by search query
    if (searchQuery.value?.trim()) {
        const query = searchQuery.value.toLowerCase().trim();
        result = result.filter((article) => article.title.toLowerCase().includes(query) || article.summary.toLowerCase().includes(query) || article.tags.some((tag) => tag.includes(query)));
    }

    // Filter by category
    if (selectedCategory.value) {
        result = result.filter((article) => article.categoryId === selectedCategory.value);
    }

    return result;
});

const featuredArticles = computed(() => {
    return articles.value.filter((a) => a.isFeatured);
});

// Format date helper
const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

// Methods
onMounted(() => {
    // Simulate loading
    setTimeout(() => {
        loading.value = false;
    }, 800);
});

const viewArticle = (article) => {
    currentArticle.value = article;
    showArticleDialog.value = true;

    // In a real app, you would navigate to a dedicated article page
    // router.push(`/articles/${articleId}`);

    // Increment view count
    const articleToUpdate = articles.value.find((a) => a.id === article.id);
    if (articleToUpdate) {
        articleToUpdate.views += 1;
    }
};

const markArticleHelpful = (articleId) => {
    const article = articles.value.find((a) => a.id === articleId);
    if (article) {
        article.helpful += 1;
        toast.add({
            severity: 'success',
            summary: 'Thank you',
            detail: 'Your feedback has been recorded',
            life: 3000
        });
    }
};

const selectCategory = (categoryId) => {
    selectedCategory.value = selectedCategory.value === categoryId ? null : categoryId;
};

const getCategoryName = (categoryId) => {
    const category = categories.value.find((c) => c.id === categoryId);
    return category ? category.name : '';
};

const getCategoryIcon = (categoryId) => {
    const category = categories.value.find((c) => c.id === categoryId);
    return category ? category.icon : 'pi pi-file';
};

const getCategoryColor = (categoryId) => {
    const category = categories.value.find((c) => c.id === categoryId);
    return category ? category.color : 'bg-gray-100 text-gray-700';
};
</script>

<template>
    <div class="card">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
                <h1 class="text-3xl font-semibold mb-2">Banking Knowledge Center</h1>
                <p class="text-gray-600">Resources and guides for banking professionals</p>
            </div>
        </div>

        <!-- Search and Categories -->
        <div class="mb-8">
            <div class="p-input-icon-left w-full mb-6">
                <!-- <i class="pi pi-search"></i> -->
                <InputText v-model="searchQuery" placeholder="Search articles..." class="w-full p-inputtext-lg" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                    v-for="category in categories"
                    :key="category.id"
                    class="p-4 border rounded-lg text-center cursor-pointer transition-all hover:shadow-md"
                    :class="{ 'border-primary bg-primary/5': selectedCategory === category.id }"
                    @click="selectCategory(category.id)"
                >
                    <div :class="['w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3', category.color]">
                        <i :class="['text-xl', category.icon]"></i>
                    </div>
                    <h3 class="font-medium">{{ category.name }}</h3>
                </div>
            </div>

            <div v-if="selectedCategory || searchQuery" class="mt-4 flex items-center">
                <Badge :value="selectedCategory ? getCategoryName(selectedCategory) : 'Search Results'" severity="primary" class="mr-2" />
                <span class="text-sm text-gray-600 mr-4"> {{ filteredArticles.length }} result{{ filteredArticles.length !== 1 ? 's' : '' }} </span>
                <Button
                    label="Clear Filters"
                    icon="pi pi-filter-slash"
                    text
                    size="small"
                    @click="
                        searchQuery = '';
                        selectedCategory = null;
                    "
                    v-if="selectedCategory || searchQuery"
                />
            </div>
        </div>

        <div v-if="loading" class="flex justify-center my-12">
            <ProgressSpinner />
        </div>

        <template v-else>
            <!-- Featured Articles -->
            <div v-if="featuredArticles.length > 0 && !searchQuery && !selectedCategory" class="mb-8">
                <h2 class="text-xl font-semibold mb-4">Featured Articles</h2>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div v-for="article in featuredArticles" :key="article.id" class="border rounded-lg p-6 hover:shadow-md transition cursor-pointer bg-primary/5 border-primary/20" @click="viewArticle(article)">
                        <div class="flex items-center mb-4">
                            <i :class="[getCategoryIcon(article.categoryId), 'text-primary text-xl mr-3']"></i>
                            <h3 class="text-xl font-medium">{{ article.title }}</h3>
                        </div>

                        <p class="text-gray-600 mb-4">{{ article.summary }}</p>

                        <div class="flex flex-wrap gap-2 mb-4">
                            <Chip v-for="tag in article.tags.slice(0, 3)" :key="tag" :label="tag" class="bg-primary/10 text-primary" />
                            <span v-if="article.tags.length > 3" class="text-sm text-gray-500"> +{{ article.tags.length - 3 }} more </span>
                        </div>

                        <div class="flex justify-between items-center">
                            <div class="flex items-center">
                                <img :src="article.authorAvatar" :alt="article.author" class="w-8 h-8 rounded-full mr-2" />
                                <span class="text-sm text-gray-600">{{ article.author }}</span>
                            </div>
                            <span class="text-sm text-gray-500">{{ formatDate(article.publishedDate) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Article List -->
            <div v-if="filteredArticles.length === 0 && (searchQuery || selectedCategory)" class="text-center py-12 border rounded-lg">
                <i class="pi pi-search text-gray-400 text-4xl mb-4"></i>
                <h3 class="text-xl font-medium mb-2">No matching articles found</h3>
                <p class="text-gray-600 mb-4">Try adjusting your search terms or filters</p>
            </div>

            <div v-else class="grid grid-cols-1 gap-6">
                <div v-for="article in filteredArticles" :key="article.id" class="border rounded-lg p-6 hover:shadow-md transition cursor-pointer" @click="viewArticle(article)">
                    <div class="flex flex-col md:flex-row md:items-start gap-4">
                        <div class="md:w-1/6 flex justify-center">
                            <div :class="['w-16 h-16 rounded-full flex items-center justify-center', getCategoryColor(article.categoryId)]">
                                <i :class="[getCategoryIcon(article.categoryId), 'text-2xl']"></i>
                            </div>
                        </div>

                        <div class="md:w-5/6">
                            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                                <h3 class="text-xl font-medium">{{ article.title }}</h3>
                                <Tag :value="getCategoryName(article.categoryId)" :severity="article.categoryId === 1 ? 'danger' : article.categoryId === 2 ? 'success' : 'info'" />
                            </div>

                            <p class="text-gray-600 mb-4">{{ article.summary }}</p>

                            <div class="flex flex-wrap gap-2 mb-4">
                                <Chip v-for="tag in article.tags.slice(0, 4)" :key="tag" :label="tag" class="bg-gray-100" />
                            </div>

                            <div class="flex flex-col sm:flex-row justify-between gap-3">
                                <div class="flex items-center">
                                    <img :src="article.authorAvatar" :alt="article.author" class="w-8 h-8 rounded-full mr-2" />
                                    <div>
                                        <div class="text-sm font-medium">{{ article.author }}</div>
                                        <div class="text-xs text-gray-500">{{ article.authorRole }}</div>
                                    </div>
                                </div>
                                <div class="flex items-center text-sm text-gray-500 gap-4">
                                    <span><i class="pi pi-calendar mr-1"></i>{{ formatDate(article.publishedDate) }}</span>
                                    <span><i class="pi pi-eye mr-1"></i>{{ article.views }}</span>
                                    <span><i class="pi pi-thumbs-up mr-1"></i>{{ article.helpful }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <!-- Article Dialog -->
        <Dialog v-model:visible="showArticleDialog" :header="currentArticle?.title" :modal="true" :closable="true" :dismissableMask="true" :style="{ width: '90vw', maxWidth: '1000px' }" :maximizable="true">
            <div v-if="currentArticle" class="article-content">
                <div class="flex justify-between items-center mb-6 pb-4 border-b">
                    <div class="flex items-center">
                        <img :src="currentArticle.authorAvatar" :alt="currentArticle.author" class="w-10 h-10 rounded-full mr-3" />
                        <div>
                            <div class="font-medium">{{ currentArticle.author }}</div>
                            <div class="text-sm text-gray-500">{{ currentArticle.authorRole }}</div>
                        </div>
                    </div>
                    <div class="text-sm text-gray-500">
                        <span v-if="currentArticle.updatedDate > currentArticle.publishedDate"> Updated: {{ formatDate(currentArticle.updatedDate) }} </span>
                        <span v-else> Published: {{ formatDate(currentArticle.publishedDate) }} </span>
                    </div>
                </div>

                <!-- Use a markdown renderer here -->
                <div v-html="renderMarkdown(currentArticle.content)"></div>

                <div class="mt-8 pt-4 border-t">
                    <div class="flex justify-between items-center">
                        <div class="flex flex-wrap gap-2">
                            <Chip v-for="tag in currentArticle.tags" :key="tag" :label="tag" class="bg-gray-100" />
                        </div>
                        <div>
                            <Button label="Helpful" icon="pi pi-thumbs-up" outlined @click="markArticleHelpful(currentArticle.id)" />
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<style scoped>
.article-content :deep(h1) {
    font-size: 2rem;
    font-weight: 600;
    margin-top: 0;
    margin-bottom: 1.5rem;
}

.article-content :deep(h2) {
    font-size: 1.5rem;
    font-weight: 600;
    margin-top: 2rem;
    margin-bottom: 1rem;
}

.article-content :deep(h3) {
    font-size: 1.25rem;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
}

.article-content :deep(p) {
    margin-bottom: 1rem;
    line-height: 1.6;
}

.article-content :deep(ul),
.article-content :deep(ol) {
    margin-bottom: 1rem;
    padding-left: 2rem;
}

.article-content :deep(li) {
    margin-bottom: 0.5rem;
}

.article-content :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1.5rem;
}

.article-content :deep(table th),
.article-content :deep(table td) {
    border: 1px solid #e2e8f0;
    padding: 0.75rem;
}

.article-content :deep(table th) {
    background-color: #f8fafc;
    font-weight: 600;
}

.article-content :deep(code) {
    font-family: monospace;
    background-color: #f1f5f9;
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
}

.article-content :deep(pre) {
    background-color: #1e293b;
    color: #e2e8f0;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin-bottom: 1.5rem;
}

.article-content :deep(pre code) {
    background-color: transparent;
    padding: 0;
    color: inherit;
    font-size: 0.875rem;
}

.article-content :deep(blockquote) {
    border-left: 4px solid #cbd5e1;
    padding-left: 1rem;
    margin-left: 0;
    margin-right: 0;
    font-style: italic;
    color: #64748b;
}

.p-progressspinner {
    width: 50px;
    height: 50px;
}
</style>
