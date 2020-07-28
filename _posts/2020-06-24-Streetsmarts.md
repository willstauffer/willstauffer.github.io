---
layout: post
title: 🚙 Street Smarts- 💵 Price and 🏭 CO2 of any car
subtitle: Building a website from scratch with nine people in eight weeks.
bigimg: /img/boat.png
tags: [data science, machine learning, api]
---

## Street Smarts

Street Smarts was my biggest data science project to date. In this post, I'll lay out some of the challenges in successes that we had during eight weeks of building Street Smarts.
https://www.streetsmarts.online/

## The product

Street Smarts is a website that allows a user to input the make, model, and year of a car, and learn about the cost to own and carbon emissions of that vehicle. You can also compare up to three different vehicles.

![Gif](/img/streetsmartsgiphy.gif)

## The team

We had a cross functional team of nine people- web developers, data scientists, a UX designer, and a team lead. This was the first major coding project that most of us had worked on, and we were all thrown together as a team for the first time. Additionally, most of us had just learned to code four months prior, as we were all at a similar stage in Lambda School.

![team](/img/streetsmartsteam.png)

## Research & Planning

We began this project from scratch, with input from a Lambda School stakeholder who guided the vision for the project. After doing some research into existing car price websites like Kelley Blue Book and Cars.com, we realized that these websites didn't have any metric for the carbon emissions of vehicles. We decided that price and carbon emissions were the most important metrics to display on Street Smarts, as we were filling a gap in the market.

We broke the project down into the web team (front and back end), UX, and my team, data science.

## Data

The first challenge for the data science team was to source our data. We wanted a wide variety of cars for a user to choose from, so we found a dataset created by the U.S. Environmental Protection Agency (EPA). This dataset contained over 40K models of vehicles from the last 40+ years, along with attributes such as miles per gallon, fuel type, number of engine cylinders, and more. The one thing it was missing is price.

To get price estimates for each vehicle, we sourced a dataset from Kaggle that contained a half million Craigslist car listings. This had a big advantage in that it was scraped just a few months prior, so we knew the prices were about as accurate as we could get. The huge disadvantage, however, was that the car models from the EPA dataset and the car models from the Craigslist dataset didn't match exactly.

## Machine Learning Model

We wanted to predict the price of a car based on the make, model, and year. We used our Craigslist dataset with 500K rows.

To start, we took the mean average error of the mean price of the our whole dataset- around $8k. If you just guessed the mean value, you would be off on average by $8000.

![team](/img/Street_Smarts_Statistical_Model_Progress.png)

As we iterated on the model, we tried linear regressions, random forests, and neural networks. Ultimately, we arrived at an MAE of around $2k using a random forest. Another consideration was our model size- for example, we were unable to deploy giant 1GB neural networks to AWS. When considering technical limitations, user load times, and performance, the random forest was our best performer.


## Heroku and Flask
Now that we had a model, we needed to deploy it live to production. The team was experienced with Heroku and Flask, so for our first iteration, we chose a Flask app to create an API that would return data to the web team. We got inputs of make, model, and year, and we would return a predicted price.

To get those inputs, however, we needed a database of all the possible makes, models and years. To do this, we created a Postgres database on Heroku that we populated with the data from the EPA dataset. 

## AWS Elastic Beanstalk and FastAPI

But there were a few limitations to the free tier of Heroku that we were using, and we wanted to learn AWS systems, so we decided to transition our project over to AWS. We created a database in AWS Relational Database Service (RDS) and populated it with our EPA dataset. We also deployed to production using AWS Elastic Beanstalk and FastAPI, which has some great built-in documentation.

![FastAPI1](/img/fastAPI1.png)
The auto-generated documentation of FastAPI allows you to test different inputs and make sure the API is functioning properly.

![FastAPI2](/img/fastAPI2.png)
The data science API returned these values for each car that a user selects.


![Elastic Beanstalk](/img/beanstalk.png)
The Elastic Beanstalk deployment came with many challenges, such as trying to deploy larger machine learning models and environment issues. We closely monitored the health of the application as well as dug through the logs to troubleshoot.

## Challenges

The biggest challenge of our project came when trying to merge the two datasets. The EPA data was very complete and well structured, but lacked price. The Craigslist data had real-world price, but due to varying user inputs, was messy.

The solution came in the form of a magic library called Rapid Fuzz. This would take the make, model, and year that a user selected from the drop down menus (populated from the EPA dataset) and try and find the closest match in the Craigslist dataset.

![Street Smarts menu](/img/streetsmartsmenus.png)

The Rapid Fuzz library does this with a process called fuzzy string matching that uses the Levenshtein Distance to calculate the differences between strings. https://en.wikipedia.org/wiki/Levenshtein_distance

The results are not always perfect, but it was the best way we could find to merge these two datasets.

----

Another major challenge was selecting a limited range of inputs. Our model was better when using all the avaliable features, such as location, odometer mileage, and condition, but these data had a lot of missing values and ultimately only improved the model by about 12-15%. We decided to limit our inputs to just make, model, and year, mainly to improve the user experience and increase the speed at which a user could find the information they were looking for.  

## Conclusion

Street Smarts was an incredible eight week project with a fantastic team. We learned a ton, solved real problems, and got our hands dirty in the AWS ecosystem.

## Street Smarts Demo

Click to view YouTube video.

[![](http://img.youtube.com/vi/P3gRb0KVd9Q/0.jpg)](http://www.youtube.com/watch?v=P3gRb0KVd9Q "Street Smarts")
