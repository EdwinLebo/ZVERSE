export const topics = [
  { title: 'What is a mainframe?', text: 'A mainframe is an enterprise computer designed to serve many concurrent workloads and move substantial amounts of data reliably. It may handle short transactions during the day while other workloads perform longer-running tasks.' },
  { title: 'Where mainframes are used', text: 'A bank can use a mainframe to post account activity. Retailers can settle payments, airlines can manage reservations, insurers can process claims and government agencies can administer records or benefits.' },
  { title: 'IBM Z and enterprise computing', text: 'IBM Z is a family of mainframe systems. Enterprise installations may run multiple operating environments, including z/OS and Linux, and connect services to other platforms. Application design and operational practices help determine reliability and security.' },
]

export const comparison = [
  ['Design emphasis', 'High-volume shared enterprise workloads, I/O and continuity', 'A wide range of service roles, commonly scaled across multiple nodes'],
  ['Resource organization', 'Logical partitions, shared resources and coordinated I/O', 'Physical nodes, virtual machines or containers managed by a cluster'],
  ['Typical workload', 'Concurrent transaction processing and batch alongside each other', 'Web, application, storage, compute or other specialized services'],
  ['Operations', 'Often managed with strong change control, recovery and workload policies', 'Can use equivalent controls. Operational design depends on the service'],
]

export const glossary = [
  ['z/OS', 'An IBM operating system for the IBM Z platform.'],
  ['CICS', 'Customer Information Control System. IBM CICS Transaction Server provides services for online transaction applications.'],
  ['Db2', 'IBM relational database software. Db2 for z/OS manages data and supports SQL and transaction recovery.'],
  ['RACF', 'Resource Access Control Facility. An IBM security manager used to verify identities and control access to resources.'],
  ['Workload', 'A group of related work or demand for service.'],
  ['Transaction', 'A business request or a unit of work whose changes can be committed or rolled back together.'],
  ['Throughput', 'The amount of work completed over a period, such as transactions per second.'],
  ['Latency', 'The elapsed time from a request arriving to a response or completion.'],
  ['High availability', 'A design and operating objective to limit service interruption.'],
  ['Encryption', 'Transforming readable data into ciphertext using an algorithm and a key.'],
  ['LPAR', 'Logical partition. A separated operating environment with assigned system resources.'],
  ['WLM', 'Workload Manager. The z/OS component that manages resources in relation to service goals and priorities.'],
  ['Commit', 'Completing a unit of work so its changes take effect.'],
  ['Rollback', 'Undoing uncommitted changes in a unit of work.'],
  ['SMF', 'System Management Facilities. z/OS facilities for collecting records used in accounting, performance and auditing.'],
]

export const questions = [
  ['beginner', 'What is a common design goal of a mainframe?', ['Personal gaming', 'High-volume shared workloads', 'Replacing network connections'], 1, 'Mainframes are designed for many concurrent enterprise workloads and substantial I/O.'],
  ['beginner', 'Which operation is an example of a transaction?', ['Applying a transfer between accounts', 'Measuring a monitor’s width', 'Unplugging a keyboard'], 0, 'A transfer is a unit of business work that can update account records.'],
  ['beginner', 'What does transaction latency measure?', ['Queue storage in bytes', 'Number of users registered', 'Time from request to completion'], 2, 'Latency measures elapsed time for a request. Throughput counts completed work over time.'],
  ['beginner', 'What should happen when an ATM withdrawal exceeds the balance in this lab?', ['The balance goes negative', 'The request is declined and the balance stays the same', 'The amount is halved'], 1, 'The lab applies the debit only after checking available funds.'],
  ['beginner', 'Which component keeps relational account records in this exhibit?', ['Db2', 'WLM', 'The CPU fan'], 0, 'Db2 is the relational database. The exhibit models it as the keeper of account data.'],
  ['beginner', 'Which service is associated with running online transaction applications?', ['RACF', 'An audit report', 'CICS'], 2, 'CICS Transaction Server provides an environment and services for transaction applications.'],
  ['beginner', 'What does authentication check?', ['Who is making the request', 'How long the queue is', 'Whether a balance is sufficient'], 0, 'Authentication verifies identity. Permissions are evaluated during authorization.'],
  ['beginner', 'What usually happens when arrivals exceed processing capacity for long enough?', ['Throughput becomes unlimited', 'A queue grows until capacity or admission limits intervene', 'Every request immediately becomes high priority'], 1, 'Excess demand accumulates as waiting work. A full queue may lead to admission rejections.'],
  ['beginner', 'What does high availability aim to reduce?', ['The need for a network', 'All future maintenance', 'Service interruption'], 2, 'Availability comes from architecture and operational practices. Systems can still fail.'],
  ['technical', 'What is an LPAR?', ['A logical partition with assigned resources', 'A specific Db2 SQL statement', 'An encryption key identifier'], 0, 'A logical partition provides a separated environment for an operating system or workload.'],
  ['technical', 'What does a z/OS WLM service class group?', ['Only people with the same password', 'Work with similar service goals or characteristics', 'All storage devices of one vendor'], 1, 'A service class lets WLM manage groups of work toward defined objectives.'],
  ['technical', 'What is the benefit of committing a transfer atomically?', ['Both account changes take effect together', 'It guarantees zero latency', 'It disables access checks'], 0, 'Atomicity prevents a partial debit or credit from becoming the committed outcome.'],
  ['technical', 'What is RACF used for?', ['Estimating the temperature of CPU trays', 'Allocating flight seats', 'Verifying identities and protecting resource access'], 2, 'RACF supplies security services including identification and access control.'],
  ['technical', 'What is one purpose of a channel subsystem?', ['Replacing application logic', 'Managing I/O operations', 'Setting the amount on an ATM request'], 1, 'Channel processing manages I/O and can allow the processor to perform other work during transfers.'],
  ['technical', 'What do SMF records support?', ['Performance analysis, accounting and audit', 'Changing monitor resolution', 'Encrypting the keyboard'], 0, 'SMF collects records about system and workload activity.'],
  ['technical', 'Which control protects data while it travels across a network?', ['Storage encryption only', 'FIFO scheduling', 'A protected connection such as TLS'], 2, 'TLS protects a connection between endpoints. At-rest protection applies to stored data.'],
  ['technical', 'How does queue aging help in this simulator?', ['It removes the oldest request permanently', 'It gives a long-waiting request a chance to run', 'It increases the number of processors'], 1, 'Aging moves the oldest waiting request ahead after a threshold, limiting starvation.'],
  ['technical', 'How can mainframes differ from typical personal computers?', ['They never fail', 'They cannot connect to standard networks', 'They emphasize concurrent enterprise services, I/O and operational continuity'], 2, 'These are design and operating goals. Reliability depends on the deployment and its procedures.'],
]
