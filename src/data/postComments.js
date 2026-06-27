/**
 * Per-post fallback comments for the news feed.
 * Rules:
 *  - comment authorId must NOT equal the post's authorId (no self-replies)
 *  - comments are contextually relevant to the post content
 *  - timestamps are after the post's published timestamp (and on/before APP_DATE)
 *  - the current user (user_1) does not appear here — their own comments live
 *    only in AsyncStorage, never in the seeded fallback set
 */

const POST_COMMENTS = {
  // post_1 — Zoe Harrison (user_12): NLC 2026 San Antonio Competitive Event Schedule
  post_1: [
    { id: 'c1_2', authorId: 'user_2',  text: "Found mine — Website Design is July 1 at 11 AM. Can't believe NLC is finally here!", timestamp: '2026-06-26T16:20:00' },
    { id: 'c1_3', authorId: 'user_5',  text: "Pro tip: get to the convention center early. The González Center is huge and finding your room takes time.", timestamp: '2026-06-26T18:00:00' },
    { id: 'c1_4', authorId: 'user_10', text: "Third NLC and I still get butterflies reading the schedule! We've got this, Falcons. 💙", timestamp: '2026-06-26T20:30:00' },
    { id: 'c1_5', authorId: 'user_3',  text: "Do we need a printed event confirmation, or is the digital badge on the app okay for check-in?", timestamp: '2026-06-27T08:00:00' },
    { id: 'c1_6', authorId: 'user_7',  text: "First time at NLC — any advice for first-timers? Super nervous about presenting at nationals!", timestamp: '2026-06-27T09:30:00' },
    { id: 'c1_7', authorId: 'user_8',  text: "Jordan, just be confident! National judges respond to enthusiasm. You know your material — trust your prep.", timestamp: '2026-06-27T10:45:00' },
    { id: 'c1_8', authorId: 'user_9',  text: "Already set four alarms for July 1 morning. Not missing my presentation slot for anything. 😅", timestamp: '2026-06-27T12:00:00' },
  ],

  // post_2 — Tyler Williams (user_5): Cherry Creek Sends 9 Members to NLC
  post_2: [
    { id: 'c2_2', authorId: 'user_2',  text: "9 members to nationals is our best showing ever — so proud to be one of them. Let's go Falcons! 🏆", timestamp: '2026-06-22T11:30:00' },
    { id: 'c2_3', authorId: 'user_12', text: "Best national year in chapter history. Everyone put in the work and it really shows! 🎉", timestamp: '2026-06-22T12:45:00' },
    { id: 'c2_4', authorId: 'user_10', text: "Congrats to all 9! See you all in San Antonio — let's bring home some national medals.", timestamp: '2026-06-22T14:30:00' },
    { id: 'c2_5', authorId: 'user_4',  text: "Qualifying for NLC in Public Speaking was a dream — I literally teared up at State when I found out 😭", timestamp: '2026-06-22T16:00:00' },
    { id: 'c2_6', authorId: 'user_6',  text: "Representing Colorado on the national stage. So proud of this whole group heading to Texas.", timestamp: '2026-06-23T08:30:00' },
    { id: 'c2_7', authorId: 'user_8',  text: "Three years ago we barely qualified anyone for nationals. Now 9 members at NLC. Incredible growth.", timestamp: '2026-06-23T10:15:00' },
    { id: 'c2_8', authorId: 'user_14', text: "This gave me chills. So honored to be part of this chapter. Let's make history in San Antonio!", timestamp: '2026-06-23T13:00:00' },
  ],

  // post_3 — Aisha Thompson (user_8): 2026–2027 Membership Benefits
  post_3: [
    { id: 'c3_2', authorId: 'user_5',  text: "Google Career Certificates are incredibly valuable — especially for anyone planning a tech career. Game changer.", timestamp: '2026-06-10T15:30:00' },
    { id: 'c3_3', authorId: 'user_2',  text: "The $2M in scholarships is the headline for me. Renewing before September 1 for sure. Don't sleep on this!", timestamp: '2026-06-11T09:00:00' },
    { id: 'c3_4', authorId: 'user_10', text: "Worth every penny of the membership fee. The network alone has opened more doors than anything else I've done.", timestamp: '2026-06-11T11:00:00' },
    { id: 'c3_5', authorId: 'user_14', text: "Does the LinkedIn Learning access extend through the summer? Asking for a friend (that friend is me).", timestamp: '2026-06-12T08:30:00' },
  ],

  // post_4 — Maya Singh (user_10): Mobile App Dev — What to Expect at NLC Finals
  post_4: [
    { id: 'c4_2', authorId: 'user_5',  text: "The rubric tip is huge — at nationals every point in your demo should map to a scoring criterion. Judges notice.", timestamp: '2026-06-28T19:00:00' },
    { id: 'c4_3', authorId: 'user_2',  text: "The backup demo video advice is critical. A device crashing mid-demo at NLC could sink your whole presentation.", timestamp: '2026-06-28T20:30:00' },
    { id: 'c4_4', authorId: 'user_6',  text: "Prepping confident answers to the deep architecture questions tonight. Great heads-up on the national-level judges!", timestamp: '2026-06-29T08:00:00' },
    { id: 'c4_5', authorId: 'user_7',  text: "How technical do the Q&A questions usually get at NLC finals? Want to make sure I'm ready for the 3 minutes.", timestamp: '2026-06-29T09:30:00' },
    { id: 'c4_6', authorId: 'user_15', text: "My first NLC and first time competing at nationals. Bookmarking this. Thank you so much for sharing!", timestamp: '2026-06-29T11:00:00' },
  ],

  // post_5 — Zoe Harrison (user_12): NLC Block Party & Texas Rodeo Night
  post_5: [
    { id: 'c5_1', authorId: 'user_2',  text: "Block Party tonight?! Live music and 15,000 FBLA members on the plaza — this is going to be unreal.", timestamp: '2026-06-30T08:20:00' },
    { id: 'c5_2', authorId: 'user_5',  text: "Texas Rodeo Night is always the highlight of NLC. Keep that badge on you — don't get locked out at the door!", timestamp: '2026-06-30T08:35:00' },
    { id: 'c5_3', authorId: 'user_10', text: "Third NLC and the Block Party never disappoints. Meet by the convention center fountains, everyone!", timestamp: '2026-06-30T08:45:00' },
    { id: 'c5_4', authorId: 'user_8',  text: "First NLC and I cannot wait for the rodeo. So glad both events are included in registration. 🤠", timestamp: '2026-06-30T08:55:00' },
  ],

  // post_6 — Tyler Williams (user_5): Leadership Workshops at NLC
  post_6: [
    { id: 'c6_1', authorId: 'user_8',  text: "Signed up for the 'AI in Business' workshop already — exactly the kind of session that's worth attending at NLC.", timestamp: '2026-06-24T15:00:00' },
    { id: 'c6_2', authorId: 'user_14', text: "The Career Networking workshop is perfect for members not competing. Seats really do fill fast — register early!", timestamp: '2026-06-24T18:00:00' },
    { id: 'c6_3', authorId: 'user_4',  text: "Are the Public Speaking Mastery sessions beginner-friendly? Want to attend between my competition events.", timestamp: '2026-06-25T09:30:00' },
  ],

  // post_7 — Tyler Williams (user_5): Colorado FBLA Community Service Award
  post_7: [
    { id: 'c7_2', authorId: 'user_8',  text: "We impacted 87 seniors' lives. That's not a statistic — those are real people we helped become more connected.", timestamp: '2026-03-11T09:00:00' },
    { id: 'c7_3', authorId: 'user_12', text: "Congratulations District 12! This is what FBLA is really about. Community first, competition second.", timestamp: '2026-03-11T12:00:00' },
    { id: 'c7_4', authorId: 'user_14', text: "I remember the first Saturday with only 6 volunteers. Now 400 hours. Look how far we've come!", timestamp: '2026-03-12T08:00:00' },
    { id: 'c7_5', authorId: 'user_4',  text: "This is why I joined FBLA — making a real difference in the community. So proud to be part of this chapter!", timestamp: '2026-03-12T11:30:00' },
  ],

  // post_8 — Amara Okafor (user_14): 2026–2027 Colorado State Officers Elected
  post_8: [
    { id: 'c8_2', authorId: 'user_5',  text: "Congrats to the new state officer team! Excited to see the vision they bring for growing Colorado FBLA next year.", timestamp: '2026-06-18T14:00:00' },
    { id: 'c8_3', authorId: 'user_2',  text: "Getting installed at the NLC closing ceremony in San Antonio is such a special way to start their term! 🎉", timestamp: '2026-06-19T09:00:00' },
    { id: 'c8_4', authorId: 'user_11', text: "Just checked the full officer list on the Colorado FBLA site. Strong team — congratulations to all of them!", timestamp: '2026-06-19T12:30:00' },
  ],

  // post_9 — Aisha Thompson (user_8): San Antonio Travel Tips
  post_9: [
    { id: 'c9_1', authorId: 'user_9',  text: "The River Walk tip is clutch — had dinner there last night after competition. Short walk from the convention center.", timestamp: '2026-06-28T16:00:00' },
    { id: 'c9_2', authorId: 'user_14', text: "Comfortable shoes is real advice — my step count was 6 miles yesterday. And the VIA shuttle saved us so much time!", timestamp: '2026-06-29T09:00:00' },
  ],

  // post_10 — Tyler Williams (user_5): National Officer Candidate Voting Opens Tomorrow
  post_10: [
    { id: 'c10_1', authorId: 'user_2',  text: "Reviewing all 12 candidate platforms in the NLC app tonight so I'm ready to vote at the General Session. 🗳️", timestamp: '2026-06-30T09:20:00' },
    { id: 'c10_2', authorId: 'user_14', text: "The candidate speeches this morning were incredible. Going to be a tough choice for those 6 positions!", timestamp: '2026-06-30T09:35:00' },
    { id: 'c10_3', authorId: 'user_12', text: "Every NLC delegate should make sure they vote — this is how we shape national FBLA leadership. Don't skip it!", timestamp: '2026-06-30T09:50:00' },
    { id: 'c10_4', authorId: 'user_4',  text: "Is voting only at the 10 AM General Session, or is there a window in the app afterward? Want to make sure I don't miss it.", timestamp: '2026-06-30T10:05:00' },
  ],

  // post_11 — Maya Singh (user_10): How to Nail Your 7-Minute NLC Presentation
  post_11: [
    { id: 'c11_2', authorId: 'user_5',  text: "The dedicated architecture segment is key. National judges really do weight the technical explanation heavily.", timestamp: '2026-06-25T22:00:00' },
    { id: 'c11_3', authorId: 'user_6',  text: "0:45–1:30 for the problem statement is genius. Gets judges emotionally invested before the demo even starts.", timestamp: '2026-06-26T09:00:00' },
    { id: 'c11_4', authorId: 'user_15', text: "How do you handle it if a judge asks a question during the 7 minutes? Do you pause or keep going?", timestamp: '2026-06-26T11:30:00' },
    { id: 'c11_5', authorId: 'user_2',  text: "This structure works perfectly for Website Design too with slight tweaks. Saving this before my NLC presentation!", timestamp: '2026-06-26T14:00:00' },
  ],

  // post_12 — Zoe Harrison (user_12): Colorado FBLA × Denver Metro Chamber Mentorship
  post_12: [
    { id: 'c12_1', authorId: 'user_2',  text: "Applied already! A Lockheed Martin mentor would be incredible for my engineering career plans.", timestamp: '2026-03-12T13:00:00' },
    { id: 'c12_2', authorId: 'user_10', text: "DaVita and Centura Health connections are perfect for members considering healthcare careers too.", timestamp: '2026-03-13T09:00:00' },
    { id: 'c12_3', authorId: 'user_5',  text: "Charles Schwab mentors for anyone in finance — this mentor list is seriously impressive.", timestamp: '2026-03-13T11:30:00' },
    { id: 'c12_4', authorId: 'user_8',  text: "This is the most concrete professional development benefit I've ever seen from FBLA. Signing up immediately.", timestamp: '2026-03-14T09:00:00' },
  ],

  // post_13 — Tyler Williams (user_5): 2027 NLC Announced — Columbus, Ohio
  post_13: [
    { id: 'c13_1', authorId: 'user_2',  text: "Back-to-back nationals — let's make Columbus 2027 happen! Starting my portfolio for next year right now.", timestamp: '2026-06-29T15:00:00' },
    { id: 'c13_2', authorId: 'user_7',  text: "As a sophomore this is exactly the motivation I needed. Columbus 2027 is officially my target. 🚀", timestamp: '2026-06-29T17:30:00' },
    { id: 'c13_3', authorId: 'user_4',  text: "Registration opening in January 2027 gives us plenty of runway. Time to lock in our competitive events early.", timestamp: '2026-06-29T19:00:00' },
    { id: 'c13_4', authorId: 'user_6',  text: "Ohio is so much closer for travel than Texas was. Already excited for next year's national appearance!", timestamp: '2026-06-30T08:30:00' },
    { id: 'c13_5', authorId: 'user_9',  text: "Just grabbed the next-year resources from the Resources tab. Never too early to start prepping for Columbus.", timestamp: '2026-06-30T09:15:00' },
  ],

  // post_14 — Tyler Williams (user_5): Member Spotlight — Vedaant Pareek Advances to NLC
  post_14: [
    { id: 'c14_1', authorId: 'user_2',  text: "Vedaant, this is so well deserved! I've seen how hard you've worked on ConnectFBLA. Go crush it at NLC! 🚀", timestamp: '2026-06-21T17:00:00' },
    { id: 'c14_2', authorId: 'user_10', text: "One Mobile App Dev competitor to another — your app concept is brilliant. Can't wait to connect in San Antonio! 🏆", timestamp: '2026-06-21T18:30:00' },
    { id: 'c14_3', authorId: 'user_12', text: "1st at State and a spot at nationals is a huge achievement. Cherry Creek is so lucky to have you representing us!", timestamp: '2026-06-22T09:00:00' },
    { id: 'c14_4', authorId: 'user_4',  text: "I tried ConnectFBLA and it's genuinely incredible. The real-time chat feature feels like a real professional product.", timestamp: '2026-06-22T11:00:00' },
    { id: 'c14_5', authorId: 'user_8',  text: "From everyone in District 12 — we are all cheering you on at NLC, Vedaant! Bring home that national medal. 🏆💙", timestamp: '2026-06-22T13:30:00' },
    { id: 'c14_6', authorId: 'user_14', text: "1st at State AND a full-featured FBLA app? You're an inspiration to every member in Colorado. Go get it at NLC!", timestamp: '2026-06-22T15:00:00' },
  ],

  // post_15 — Zoe Harrison (user_12): NLC Opening Ceremony Recap
  post_15: [
    { id: 'c15_1', authorId: 'user_5',  text: "What a night! 15,000 members and all 50 state flags — the energy in that arena was unreal. Let's make Colorado proud.", timestamp: '2026-06-29T22:45:00' },
    { id: 'c15_2', authorId: 'user_2',  text: "Jasmine Carter's keynote gave me chills. 'Lead now, don't wait for permission' — writing that on my mirror. 🔥", timestamp: '2026-06-30T08:00:00' },
  ],
};

export default POST_COMMENTS;
