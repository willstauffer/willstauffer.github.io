---
layout: post
title: What kind of web traffic generates the most money?
subtitle: Building machine learning models using Google Analytics data
bigimg: /img/boat.png
tags: [analytics, machine learning]
---
Google Analytics is a valuable tool for any business, but it’s a challenge to do any in-depth analysis using Google’s simple dashboard. I wanted to build a robust model that would predict revenue based on over a dozen attributes, such as how many pages a user visits on the website, user location, and the time of year.

I looked at two years of website data for a business that sells boats.

## Wrangling my data
As soon as I began, I hit my first major Google Analytics limitation: You are only allowed to export .csv files that are five features and five metrics wide, and five thousand rows long. This means that I was forced to export these maximum sized .csv’s quite a few times and then merge them in a Jupyter notebook. There is a way to get a somewhat larger .csv using the Google Analytics API, but given the size of my data, it wasn’t worth it to set that up.

![google_analytics_dashboard](/img/GAdashboard2.png)
**This is what the Google Analytics reporting looks like.**

Another problem with this specific data set is that I only had usable data from the last two years, even though I could access the website data going back seven years. This is due to the way that the Google Analytics account was reconfigured two years ago. There is probably a workaround to get more years of data, but it would require a level of data wrangling that I decided was outside the scope of this project.

## Creating a model
Initially, my goal was to predict the type of product that was being purchased. However, I found this extremely difficult to do, given my smaller data size (~7000 rows) and high variety of products. Even after binning down the product types, my model tended to just guess the majority class, barely beating the baseline in the best cases and underperforming the baseline in the worst cases. I was also limited by what features I could choose to eliminate leakage. For example, using the revenue to predict product type gave me 99%+ accuracy, so revenue was dropped.


![confusion_matrix](/img/confusion_matrix.png)
**This confusion matrix shows that my model mostly just guessed the majority class, only predicting the other categories a few times.**

So I pivoted. Instead trying to predict the type of product, I tried predicting the revenue generated per transaction. This left me with an even smaller number of observations (~3500), but a continuous target variable. It also allowed me to export a larger number of potential predicting features from Google Analytics, because Google Analytics is quite picky with what combinations of data it allows.

This new goal meant that I was able to beat the baseline in just a few model iterations. It still wasn’t great- only coming up with an R-squared of around .1, meaning my model only explained 10% of the variation in the data- but it beats guessing!

Part of the problem with my target variable, revenue, is that it has a bimodal distribution. Transactions tend to be either quite small, or quite large.
![bimodal graph](/img/bimodal.png)
**People are usually either purchasing accessories (~$100) or boats (~$1000).**

This explains the high mean absolute error I was able to achieve with my model- just over $700. If my model takes a guess at the price, it’s off by $700 on average. That’s quite a lot when some of the products on the website are only $50 or so! 

My model does beat the baseline, however- just guessing, the mean absolute error is over $800.

# Visualizing the model #

I wanted to see how the model was arrving at its conclusions, and determine what the most important factors are in predicting revenue.

![permutations](/img/permutation_importances.png)

**The top features by permutation importance.**

One factor that I had assumed would be important is the day of the year. People are buying more boats in the summer and over the holidays, as shown by this revenue vs time graph:
![dayofyear](/img/day_of_year_vs_revenue.png)
**Note the spikes in summer and over the holidays.**

Indeed, when this "Day of Year" feature is isolated, it does have an effect on the model during those times:
![dayofyear2](/img/PDP_dayofyear.png)
**Partial dependence plot of how "day of year" affects the XGBoost model.**

These Partial Dependence plots show how the Page Depth and Session Duration impact the revenue.
![pagedepth](/img/PDP_page_depth.png)

![sessionduration](/img/PDP_session_duration.png)


And these are the feature importances as described by the XGBoost model.
![top16](/img/top_16_features.png)

## Deploying my web app ##

Even though my model is imperfect, it still has some valuable insights.

I decided it was time to deploy a web app to allow for other people to explore the model. I used Heroku, a (relatively) simple platform for creating web apps. I’ve built simple websites since the early 2000’s, but this was my first try at building a website with interactive modeling. 

For simplicity's sake, I built a new model using only the top three most important features as described above. A user only has three inputs instead of over a dozen.

**You can [try for yourself](https://boatdata.herokuapp.com/)- just adjust the inputs and see how the revenue changes!**

![boat](/img/boat2.jpg)
