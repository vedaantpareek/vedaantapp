/**
 * Per-post fallback comments for the news feed.
 * Rules:
 *  - comment authorId must NOT equal the post's authorId (no self-replies)
 *  - comments are contextually relevant to the post content
 *  - timestamps are after the post's published timestamp
 */

const POST_COMMENTS = {
  // post_1 — Zoe Harrison (user_12): State Conference Schedule
  post_1: [
    { id: 'c1_1', authorId: 'user_1',  text: "Checked my slot — Mobile App Dev is at 10:30 AM in Room C-4! Thanks for posting this, Zoe.", timestamp: '2026-03-28T15:10:00Z' },
    { id: 'c1_2', authorId: 'user_2',  text: "Found mine too! Website Design is Saturday at 11 AM. Can't believe it's almost here.", timestamp: '2026-03-28T16:20:00Z' },
    { id: 'c1_3', authorId: 'user_5',  text: "Pro tip: arrive 20 minutes early. The parking garage at Marriott DTC fills up fast on competition morning.", timestamp: '2026-03-29T09:00:00Z' },
    { id: 'c1_4', authorId: 'user_10', text: "Third year going to State and I still get butterflies reading the schedule! We've got this, everyone. 💙", timestamp: '2026-03-29T11:30:00Z' },
    { id: 'c1_5', authorId: 'user_3',  text: "Do we need to bring a printed event confirmation, or is digital on the phone okay for check-in?", timestamp: '2026-03-29T14:00:00Z' },
    { id: 'c1_6', authorId: 'user_7',  text: "First time at State — any advice for first-timers? Super nervous about everything!", timestamp: '2026-03-30T10:00:00Z' },
    { id: 'c1_7', authorId: 'user_8',  text: "Jordan, just be confident! Judges respond to enthusiasm. You know your material — trust your prep.", timestamp: '2026-03-30T11:15:00Z' },
    { id: 'c1_8', authorId: 'user_9',  text: "Already set four alarms for Friday morning. Not missing that bus for anything. 😅", timestamp: '2026-03-31T08:00:00Z' },
  ],

  // post_2 — Tyler Williams (user_5): District 12 Qualifiers
  post_2: [
    { id: 'c2_1', authorId: 'user_1',  text: "So proud to be one of the 47! Cherry Creek District 12 is going to crush it at State. 🏆", timestamp: '2026-03-20T10:00:00Z' },
    { id: 'c2_2', authorId: 'user_2',  text: "47 qualifiers is insane — that's nearly double last year's count. We've come so far as a chapter!", timestamp: '2026-03-20T11:30:00Z' },
    { id: 'c2_3', authorId: 'user_12', text: "So incredible. Best year for our district ever. Everyone put in the work and it really shows! 🎉", timestamp: '2026-03-20T12:45:00Z' },
    { id: 'c2_4', authorId: 'user_10', text: "Congrats to all qualifiers! See you all in Denver — let's bring home some golds.", timestamp: '2026-03-21T09:00:00Z' },
    { id: 'c2_5', authorId: 'user_4',  text: "I qualified in Public Speaking!! First time going to State, I literally teared up when I found out 😭", timestamp: '2026-03-21T14:00:00Z' },
    { id: 'c2_6', authorId: 'user_6',  text: "Congrats to all the CS and Business Tech qualifiers! Let's represent District 12 with pride.", timestamp: '2026-03-22T08:30:00Z' },
    { id: 'c2_7', authorId: 'user_8',  text: "This is such a proud moment. Three years ago we barely sent 20 members to State. Now 47. Incredible growth.", timestamp: '2026-03-22T15:00:00Z' },
    { id: 'c2_8', authorId: 'user_14', text: "This announcement gave me chills. So honored to be part of this chapter. Let's make history in Denver!", timestamp: '2026-03-23T10:00:00Z' },
  ],

  // post_3 — Aisha Thompson (user_8): FBLA Membership Benefits
  post_3: [
    { id: 'c3_1', authorId: 'user_1',  text: "LinkedIn Learning access is huge! I've already started the product management certification.", timestamp: '2026-03-15T13:00:00Z' },
    { id: 'c3_2', authorId: 'user_5',  text: "Google Career Certificates are incredibly valuable — especially for anyone planning a tech career. This is a game changer.", timestamp: '2026-03-15T15:30:00Z' },
    { id: 'c3_3', authorId: 'user_2',  text: "The $2M in scholarships is the headline for me. Renewing my membership today. Don't sleep on this!", timestamp: '2026-03-16T09:00:00Z' },
    { id: 'c3_4', authorId: 'user_10', text: "Worth every penny of the membership fee. The network alone has opened more doors than anything else I've done.", timestamp: '2026-03-16T11:00:00Z' },
    { id: 'c3_5', authorId: 'user_14', text: "Does anyone know if the LinkedIn Learning access extends through the summer? Asking for a friend (that friend is me).", timestamp: '2026-03-17T08:30:00Z' },
  ],

  // post_4 — Maya Singh (user_10): Mobile App Dev Presentation Tips
  post_4: [
    { id: 'c4_1', authorId: 'user_1',  text: "This is gold. Printing this out and taping it above my monitor. Seven minutes really does fly.", timestamp: '2026-03-25T17:30:00Z' },
    { id: 'c4_2', authorId: 'user_5',  text: "The rubric tip is huge — every point in your demo should map directly to a scoring criterion. Judges notice.", timestamp: '2026-03-25T19:00:00Z' },
    { id: 'c4_3', authorId: 'user_2',  text: "The physical device advice is critical. A simulator crashing mid-demo could sink your whole presentation.", timestamp: '2026-03-26T08:00:00Z' },
    { id: 'c4_4', authorId: 'user_6',  text: "'Why React Native?' — writing a full, confident answer to this tonight. Great prompt to prepare for!", timestamp: '2026-03-26T10:30:00Z' },
    { id: 'c4_5', authorId: 'user_7',  text: "What does a good MVVM explanation look like for a mobile app demo? Do you use slides for that segment?", timestamp: '2026-03-27T09:00:00Z' },
    { id: 'c4_6', authorId: 'user_15', text: "This is my first competitive event at State. Bookmarking this. Thank you so much for sharing this!", timestamp: '2026-03-27T14:00:00Z' },
  ],

  // post_5 — Zoe Harrison (user_12): NLC 2026 Atlanta Hotel
  post_5: [
    { id: 'c5_1', authorId: 'user_2',  text: "Adding April 10 to my calendar right now. The FBLA hotel block at NLC always sells out within 48 hours.", timestamp: '2026-03-30T09:30:00Z' },
    { id: 'c5_2', authorId: 'user_5',  text: "$149/night is honestly incredible for a full-service conference hotel in Atlanta. Book the moment registration opens.", timestamp: '2026-03-30T11:00:00Z' },
    { id: 'c5_3', authorId: 'user_10', text: "Three-time State qualifier — hotel blocks for NLC are gone in under 24 hours. Set a phone alarm for April 10.", timestamp: '2026-03-30T14:30:00Z' },
    { id: 'c5_4', authorId: 'user_8',  text: "Hoping to qualify in Business Ethics so I can experience NLC for the first time. Fingers crossed! 🤞", timestamp: '2026-03-31T09:00:00Z' },
  ],

  // post_6 — Tyler Williams (user_5): Business Ethics Workshop Recording
  post_6: [
    { id: 'c6_1', authorId: 'user_8',  text: "Dr. Walsh's ethical decision-making frameworks were incredibly applicable to real business situations. Highly recommend the recording.", timestamp: '2026-03-18T15:00:00Z' },
    { id: 'c6_2', authorId: 'user_14', text: "Just finished watching — the whistleblower scenario was particularly eye-opening. Great session for anyone in ethics events.", timestamp: '2026-03-19T10:00:00Z' },
    { id: 'c6_3', authorId: 'user_4',  text: "How long is the full recording? Want to make sure I can fit it in before the State crunch.", timestamp: '2026-03-20T09:30:00Z' },
  ],

  // post_7 — Tyler Williams (user_5): Community Service Award
  post_7: [
    { id: 'c7_1', authorId: 'user_1',  text: "So proud of everyone who gave up their Saturday mornings for this. This is exactly what FBLA is about. 🎉", timestamp: '2026-03-10T16:30:00Z' },
    { id: 'c7_2', authorId: 'user_8',  text: "We impacted 87 seniors' lives. That's not a statistic — those are real people we helped become more connected.", timestamp: '2026-03-11T09:00:00Z' },
    { id: 'c7_3', authorId: 'user_12', text: "Congratulations District 12! This is what FBLA is really about. Community first, competition second.", timestamp: '2026-03-11T12:00:00Z' },
    { id: 'c7_4', authorId: 'user_14', text: "I remember the first Saturday with only 6 volunteers. Now 400 hours. Look how far we've come!", timestamp: '2026-03-12T08:00:00Z' },
    { id: 'c7_5', authorId: 'user_4',  text: "This is why I joined FBLA — making a real difference in the community. So proud to be part of this chapter!", timestamp: '2026-03-12T11:30:00Z' },
  ],

  // post_8 — Amara Okafor (user_14): FBLA Week 2026
  post_8: [
    { id: 'c8_1', authorId: 'user_1',  text: "FBLA Blue & Gold Day on Monday — already planning my outfit. Let's show some school spirit! 💙💛", timestamp: '2026-03-22T11:00:00Z' },
    { id: 'c8_2', authorId: 'user_5',  text: "The resume workshop with actual HR professionals is a must-attend. Better prep than anything you'll find online.", timestamp: '2026-03-22T14:00:00Z' },
    { id: 'c8_3', authorId: 'user_2',  text: "Elitch Gardens for the chapter social?! That's amazing. Chapter leadership really came through this year! 🎉", timestamp: '2026-03-23T09:00:00Z' },
    { id: 'c8_4', authorId: 'user_11', text: "Social media coverage for the whole week is going to be incredible. Can't wait to see the content!", timestamp: '2026-03-23T12:30:00Z' },
  ],

  // post_9 — Aisha Thompson (user_8): Interview Skills Webinar Recap
  post_9: [
    { id: 'c9_1', authorId: 'user_9',  text: "The STAR method tip was the most useful takeaway. I realize I've been answering behavioral questions completely wrong.", timestamp: '2026-03-14T16:00:00Z' },
    { id: 'c9_2', authorId: 'user_14', text: "Maya's advice on maintaining 75% eye contact is spot on — practiced in the mirror for an hour after watching.", timestamp: '2026-03-15T09:00:00Z' },
  ],

  // post_10 — Tyler Williams (user_5): State Officer Candidate Applications
  post_10: [
    { id: 'c10_1', authorId: 'user_2',  text: "Already drafting my application for chapter reporter! Such an amazing opportunity to grow as a leader.", timestamp: '2026-03-05T11:00:00Z' },
    { id: 'c10_2', authorId: 'user_14', text: "The 2-minute intro video requirement is actually great practice for elevator pitches and interviews.", timestamp: '2026-03-06T09:00:00Z' },
    { id: 'c10_3', authorId: 'user_12', text: "Excited to see who the next class of state officers will be. Rooting for all applicants from our chapter!", timestamp: '2026-03-07T10:30:00Z' },
    { id: 'c10_4', authorId: 'user_4',  text: "Is the application open to 10th graders? I want to apply but want to confirm I'm eligible first.", timestamp: '2026-03-08T14:00:00Z' },
  ],

  // post_11 — Maya Singh (user_10): How to Prepare Your App Demo in 7 Minutes
  post_11: [
    { id: 'c11_1', authorId: 'user_1',  text: "The time breakdown is so helpful. Practicing my full demo with a stopwatch tonight using exactly this structure.", timestamp: '2026-03-26T21:00:00Z' },
    { id: 'c11_2', authorId: 'user_5',  text: "The dedicated architecture segment is key. Judges really do weight the technical explanation heavily in the rubric.", timestamp: '2026-03-27T08:30:00Z' },
    { id: 'c11_3', authorId: 'user_6',  text: "0:45–1:30 for the problem statement is genius. Gets judges emotionally invested before the demo even starts.", timestamp: '2026-03-27T10:00:00Z' },
    { id: 'c11_4', authorId: 'user_15', text: "How do you handle it if a judge asks a question mid-demo? Do you pause the timer or keep going?", timestamp: '2026-03-28T09:00:00Z' },
    { id: 'c11_5', authorId: 'user_2',  text: "This structure works perfectly for Website Design too with slight modifications. Saving this permanently!", timestamp: '2026-03-28T12:00:00Z' },
  ],

  // post_12 — Zoe Harrison (user_12): Colorado FBLA Mentorship Partnership
  post_12: [
    { id: 'c12_1', authorId: 'user_2',  text: "Applied already! A Lockheed Martin mentor would be incredible for my engineering career plans.", timestamp: '2026-03-12T13:00:00Z' },
    { id: 'c12_2', authorId: 'user_10', text: "DaVita and Centura Health connections are perfect for members considering healthcare careers too.", timestamp: '2026-03-13T09:00:00Z' },
    { id: 'c12_3', authorId: 'user_5',  text: "Charles Schwab mentors for anyone in finance — this mentor list is seriously impressive.", timestamp: '2026-03-13T11:30:00Z' },
    { id: 'c12_4', authorId: 'user_8',  text: "This is the most concrete professional development benefit I've ever seen from FBLA. Signing up immediately.", timestamp: '2026-03-14T09:00:00Z' },
  ],

  // post_13 — Tyler Williams (user_5): New Resources — Website Design Study Guides
  post_13: [
    { id: 'c13_1', authorId: 'user_2',  text: "The HTML5/CSS3 guide is genuinely comprehensive. Found two accessibility considerations I hadn't thought of.", timestamp: '2026-03-08T15:00:00Z' },
    { id: 'c13_2', authorId: 'user_7',  text: "The UX journey mapping guide is exactly what I needed! Huge thanks to whoever last year's finalists were.", timestamp: '2026-03-09T09:30:00Z' },
    { id: 'c13_3', authorId: 'user_4',  text: "The SEO checklist is so useful — hadn't thought about meta descriptions and alt text for a competition site.", timestamp: '2026-03-09T11:00:00Z' },
    { id: 'c13_4', authorId: 'user_6',  text: "These are genuinely high quality resources. Whoever contributed them really paid it forward to next year's competitors.", timestamp: '2026-03-10T08:30:00Z' },
    { id: 'c13_5', authorId: 'user_9',  text: "The 7-minute presentation script template is going to save me hours of planning. Exactly what I needed.", timestamp: '2026-03-10T14:00:00Z' },
  ],

  // post_14 — Tyler Williams (user_5): Member Spotlight — Vedaant Pareek
  post_14: [
    { id: 'c14_1', authorId: 'user_2',  text: "Vedaant, this is so well deserved! I've seen how hard you've worked on ConnectFBLA. Go crush it at State! 🚀", timestamp: '2026-03-02T17:00:00Z' },
    { id: 'c14_2', authorId: 'user_10', text: "One Mobile App Dev competitor to another — your app concept is brilliant. Can't wait to connect at State! 🏆", timestamp: '2026-03-02T18:30:00Z' },
    { id: 'c14_3', authorId: 'user_12', text: "District Champion is a huge achievement. Cherry Creek is so lucky to have you representing us!", timestamp: '2026-03-03T09:00:00Z' },
    { id: 'c14_4', authorId: 'user_4',  text: "I tried ConnectFBLA and it's genuinely incredible. The real-time chat feature feels like a real professional product.", timestamp: '2026-03-03T14:00:00Z' },
    { id: 'c14_5', authorId: 'user_8',  text: "From everyone in District 12 — we are all cheering you on, Vedaant! Bring home that gold. 🏆💙", timestamp: '2026-03-04T09:30:00Z' },
    { id: 'c14_6', authorId: 'user_14', text: "First place in the district AND a full-featured FBLA app? You're an inspiration to every member in Colorado.", timestamp: '2026-03-04T12:00:00Z' },
  ],

  // post_15 — Zoe Harrison (user_12): NLC Registration Reminder
  post_15: [
    { id: 'c15_1', authorId: 'user_5',  text: "April 22 comes faster than you think. Talking to my advisor TODAY. Thanks for the reminder — this is critical.", timestamp: '2026-04-01T09:00:00Z' },
    { id: 'c15_2', authorId: 'user_2',  text: "Printing this out for my advisor right now. Hard deadlines with no exceptions — this is as serious as it gets.", timestamp: '2026-04-01T10:30:00Z' },
  ],
};

export default POST_COMMENTS;
