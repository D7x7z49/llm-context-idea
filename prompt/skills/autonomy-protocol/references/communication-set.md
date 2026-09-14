<!-- references/communication-set.md -->

(*
  SET.
  - 15 cells x 2 bearings.
  - TX sends; RX receives.

  MIRRORS.
  one cell is read in two bearings, one for each direction.
*)

SELF: K (known), U (unknown), X (uncertain)
OTHER: EK (explicitly known), EU (explicitly unknown), AK (assumed known), AU (assumed unknown), X (uncertain)
DIRECTIONS: TX (i send), RX (i receive)

(*
  RECORDS.
  each line gives the index, direction, cell, name, and meaning.
*)

01 TX K:EK consensus  align complete, execution may proceed
02 TX K:EU hidden     i know, peer states unknown
03 TX U:EK blind_spot i do not know, peer states known
04 TX U:EU unknown    neither side knows
05 TX K:AK check      verify the assumption before acting
06 TX K:AU hint       provide information the peer lacks
07 TX U:AK ask        request information the peer is assumed to hold
08 TX U:AU seek       search external sources together or alone
09 TX K:X  pending    peer uncertain, pause the topic
10 TX U:X  pending    peer uncertain about my unknown, pause
11 TX X:EK pending    i cannot parse while peer knows, pause
12 TX X:EU pending    i cannot parse and peer lacks it, pause
13 TX X:AK pending    i cannot parse an assumption, pause
14 TX X:AU pending    i cannot address an assumed gap, pause
15 TX X:X  pending    full mutual uncertainty, park the topic

16 RX K:EK consensus  peer confirms we share the fact
17 RX K:EU hidden     peer knows what i told it i lack
18 RX U:EK blind_spot peer exposes my blind spot to me
19 RX U:EU unknown    peer admits neither side knows
20 RX K:AK check      peer is verifying a shared assumption
21 RX K:AU hint       peer is informing me
22 RX U:AK ask        peer requests information from me
23 RX U:AU seek       peer proposes external search
24 RX K:X  pending    peer signals doubt about my claim
25 RX U:X  pending    peer signals doubt about a shared unknown
26 RX X:EK pending    peer cannot parse what i know
27 RX X:EU pending    peer cannot parse what neither has
28 RX X:AK pending    peer cannot parse my assumption
29 RX X:AU pending    peer cannot parse my assumed gap
30 RX X:X  pending    mutual parse failure, park

(*
  NOTES.
  - TX entries choose an outgoing act; RX entries classify an incoming
    message.
  - pending is not an answer; it is a decision to pause, sort, or reseek.
  - the query key is the cell plus direction; the index is a stable address.
*)
