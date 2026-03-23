# Let's Map the Web!

Map the Web offers curated guidance for interacting with websites lacking rich
semantics or fully-adopted standards.

- [Let's Map the Web!](#lets-map-the-web)
  - [Goals and Intent](#goals-and-intent)
    - [Mapping Philosophies](#mapping-philosophies)
  - [Limitations](#limitations)
  - [Using Maps](#using-maps)
    - [Versioning](#versioning)
    - [Releases](#releases)
  - [Glossary](#glossary)

## Goals and Intent

Map the Web offers guidance on website content via a collection of living
website "Maps". These Maps describe various categorical concerns of real
websites. While semantics, standards, and specifications can help software
developers navigate data concerns on the web, such conventions are sometimes
incomplete, not widely implemented, or even leave a particular concern
completely unaddressed. The primary goal of this project is to map out live
websites which lack the implementation details that would otherwise enable
software to interact with them as intended.

### Mapping Philosophies

With the aforementioned goals and intent in mind, Maps should:

- only describe a website or website page, not how a particular consumer of Maps
  should behave
- only describe websites where a given concern is not otherwise accessible
- only capture shared web concerns; local network configurations are out of
  scope
- be as specific as possible while avoiding "brittle" descriptions
- be removed from a given Map if a site becomes navigable by other standard
  means for those concerns
- avoid staleness and be kept up-to-date
- be verified by humans
- not be consumed as an absolute guarantee; websites can and will change

Maps are not intended to replace standard functionalities of the web, only to
serve as a stopgap pending broader consensus and adoption of accepted standards.

## Limitations

While this project aspires to map all discovered gaps of the web, this is
largely expected to be unachievable, given the size and ever-changing nature of
the web.

## Using Maps

Each Map lives in its own subdirectory under `maps/`, named after its core
concern (e.g. `maps/forms/`). A Map directory contains the JSON data file
(`forms.json`), its schema (`forms.schema.json`), and a `README.md` documenting
the Map's structure and usage.

### Versioning

Each Map file includes a required top-level `version` field that identifies
which revision of its schema the file conforms to. This project uses
[semantic versioning](https://semver.org/):

- **Major**: Breaking changes to the data structure or semantics
- **Minor**: Backwards-compatible additions (e.g. new optional properties, new
  category values)
- **Patch**: Documentation or schema clarifications with no data-level impact

Consumers should check the `version` field before processing a Map and reject or
warn on unrecognized major versions.

### Releases

Map data is published as optimized builds via
[GitHub Releases](https://github.com/bitwarden/map-the-web/releases). Each
release contains minified Map JSON files, their schemas, a build manifest, and
SHA-256 checksums.

**Latest build** (always points to the newest release):

```text
https://github.com/bitwarden/map-the-web/releases/latest/download/forms.json
```

**Pinned build** (locked to a specific release tag):

```text
https://github.com/bitwarden/map-the-web/releases/download/<tag>/forms.json
```

Each release includes a `manifest.json` with build metadata (timestamp, git SHA,
and per-map schema versions) that consumers can use to check staleness or verify
compatibility.

## Glossary

- **Map**: A JSON structure describing a categorical concern of real websites.
  Each Map focuses on a single concern (e.g. forms) and lives in the `maps/` as a named
  directory alongside its documentation and schema.

- **Consumer**: Any application or tool that reads and acts on a Map. The Map
  describes what exists on a page; the consumer decides what to do with that
  information.

- **Heuristic detection**: Automated inference of page element purposes based on
  attributes, labels, or surrounding markup.
