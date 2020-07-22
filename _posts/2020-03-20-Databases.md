---
layout: post
title: What kind of databases should you use?
subtitle: Breaking down SQL, NoSQL, and NewSQL
bigimg: 
tags: [SQL, databases]
---
Setting up the right kind of database is critical for a business's success.

In this post, I'll break down the pros and cons of the major types of databases.

## SQL
SQL is an acronym for 'Structured Query Language'. This is the most common type of structure- a relational database. It's been around for decades, and has a long track record of reliabliity and consistency.

Data is stored in a predefined schema, which makes it simple to query using the common SQL language, but it's structure also constrains the types of inputs into the database.

## NoSQL

NoSQL is a non-relational database. 

One popular example is Mongo DB. MongoDB is useful becuase it allows you to put data in a database without specifiying the data type up front.

In SQL, you have a rigid framework of datatypes that are allowed, but in MongoDB the data is stored as separate documents and allows more data types.

One situation where you would want to use MongoDB would be a machine learning startup that isn't sure yet what kinds of data are going to be used in the business, and needs high performance across a large volume of data.

In the machine learning startup example, you would also likely be deploying your data on something like the AWS cloud, and MongoDB is designed for cloud performance using sharding.

A situation in which you would choose SQL over MongoDB might be a bank, where you need to make sure that every single one of your transactions are ACID (Atomic, Consistency, Isolation, Durability) compliant. 

If you were in the bank situation, you would want a very rigid schema for your data to ensure that all transations were recorded correctly, and incomplete transactions were rolled back.

## NewSQL

NewSQL is an approach that combines the reliability of ACID with the scalability of NoSQL. 

There are several different approaches of NewSQL, but essentially all the approaches are creating software efficiencies.

This is so a company (such as a bank) that would have previously required a ton of compute power to use standard relational SQL can now access the performance of NoSQL while maintaing ACID standards.

However, most companies still use some form of standard SQL.
