# Overview

Just as a disclaimer, this package is maintained by a single person who has fairly limited time to keep this up to date, so apologies for any lack of timeliness.

This project generally aims to have feature parity with Cucumber where it makes sense in the context of Jest. Many people may have certain niche preferences or experimental ideas outside of the realm of existing Jest or Cucumber features, which in many cases can work against keeping this project as simple to use and maintain as possible. If you're able to get something new and interesting working by adding additional code in your own projects to leverage the package in a unique way, please feel free to share it with the community in the [Discussions](https://github.com/bencompton/jest-cucumber/discussions) area! In the past, such ideas have even been incorporated into the package itself--one example is Automatic Step Binding.

## Issues

Issues in this repo are generally for reporting bugs and proposing new features, as opposed to asking for support. If you're strugging to get something working, you may have better luck in the Q&A area under [Discussions](https://github.com/bencompton/jest-cucumber/discussions). 

Also, please ensure bug reports have a clear description of the issue and steps to reproduce.

## PRs

When creating PRs, please note the following guidelines:

* One feature or fix per PR, please. The less code and more clarity, the more likely the PR will get merged sooner.
* New features should include docs, examples, and specs. Please see the note below on docs and examples.
* If you've created a PR that fixes an important bug or adds a Cucumber feature that's missing, there's a good chance it will get merged eventually if it's not merged in a timely manner. Many thanks to folks who have been patient enough to keep their forks in place intil their PRs finally merge.

## Documentation and Examples

Documentation and examples should be concrete, easily understood, and devoid of noise, humor, or "cuteness".

Funny rule to have for a package with a front page example about Elon Musk and rockets, which perhaps some people may have found amusing, but many others may have not because it doesn't actually help new users to understand how teams should write Gherkin in the real world. I remember my team and I initially struggling to understand how to properly use the Gherkin `Rule` keyword many years ago, and we were all scratching our heads because the only examples we could find in the Cucumber docs were about ninjas. We would have learned faster if we had more examples that demonstrated how the `Rule` keyword should be used in a real system, preferably detailing workflows that are widely used and understood, like adding a product to a shopping cart / basket, logging into a web app, making a bank deposit, etc. Examples about ninjas, Chuck Norris, and Elon Musk are probably be more entertaining when they aren't the only examples available.

With this mindset, many of the less concrete examples in this repo have already been replaced with more concrete ones, and at the risk of sounding like a killjoy, we should continute in that direction. If your docs or examples are rejected, it's not because you aren't clever or funny enough, it's that it's more important to educate than to entertain, especially when you may be providing the only examples in existence on how to use a particular feature.
