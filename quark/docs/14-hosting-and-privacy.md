# Hosting and privacy

For one family running its own copy, children's privacy law is close to a non-issue. It becomes a real obligation the moment a copy serves other people's children. This isn't legal advice; it's orientation for deciding where to run the tutor.

**The project's model:** each family runs its own copy, used only by its own children. The project doesn't host anyone's data.

## Why one family is mostly fine

COPPA (the US children's privacy law) regulates operators of commercial online services that collect personal information from children under 13. Its whole consent system exists to make sure a parent approves. A parent running software for their own kids is that parent, not an operator, and renting a server doesn't change that as long as nobody else's kids use it.

## What still matters for one family

- **The language model.** Every Ask-box question goes to the model provider. Keep names, ages and anything identifying out of the prompts. Use a provider plan that doesn't retain or train on API data, or run a local model for the Ask box.
- **Email and analytics.** The digest goes to guardians only. No tracking of any kind.
- **Backups.** Family data is encrypted before it leaves the server.

## What changes if a copy ever serves other families

That copy's owner becomes an operator: verifiable parental consent, a privacy policy, data minimization, retention limits and deletion on request. The FTC's updated COPPA rule took effect in 2025 with compliance due in 2026, and several US states have their own children's privacy laws. Other countries have their own rules (for example GDPR in the EU). It's doable, but it's a real workload and a real liability, which is why each family runs its own copy.

## Where to run it

| Option | Cost | Reliability | Data leaves the house? |
| --- | --- | --- | --- |
| Old PC at home | Free | Low. Old drives fail, and the parent is the sysadmin. Fine for prototyping. | No |
| Mini PC or Raspberry Pi at home | About $100–200 once | Medium | No |
| Small rented server | About $5–10 a month | High | Yes, encrypted, under the family's own account |
| Hybrid | Server plus tablet cache | High. The wall keeps working when the server doesn't. | Partly |

What matters more than the box: everything runs in containers so the whole system restores on any machine in about 20 minutes, and encrypted backups run automatically to a second place. With those, switching hardware later is cheap.
