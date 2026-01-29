-- Seed Vendors and Stations

DO $$
DECLARE
  v_event_id uuid;
  v_station_id uuid;
BEGIN
  -- 1. Ensure an event exists
  select id into v_event_id from public.events limit 1;
  IF v_event_id IS NULL THEN
    insert into public.events (name) values ('Queens NY Expo 2026') returning id into v_event_id;
  END IF;

  -- 2. Insert AECOM
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'AECOM', 'vendor', 'Global infrastructure consulting firm providing engineering, design, and construction management services.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'AECOM', 'George Guillaume', 'george.guillaume@aecom.com', 'Engineering & Infrastructure', 'Global infrastructure consulting firm providing engineering, design, and construction management services.');

  -- 3. Insert NYC DOB
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'NYC DOB', 'vendor', 'City agency overseeing construction safety, code enforcement, and permitting.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'NYC DOB', 'Duane Brown', 'DuaneBrown@buildings.nyc.gov', 'Government – Buildings & Construction Regulation', 'City agency overseeing construction safety, code enforcement, and permitting.');

  -- 4. Council for Airport Opportunities (via RDRC)
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'Council for Airport Opportunities (via RDRC)', 'vendor', 'Connects communities to aviation and transportation career pathways.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'Council for Airport Opportunities (via RDRC)', 'Junor Barnett', 'jbarnett@rdrc.org', 'Workforce Development', 'Connects communities to aviation and transportation career pathways.');

  -- 5. Urban Upbound
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'Urban Upbound', 'vendor', 'Provides financial counseling, workforce training, and entrepreneurship support.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'Urban Upbound', 'Jason Juliano', 'jjuliano@urbanupbound.org', 'Economic Mobility & Financial Empowerment', 'Provides financial counseling, workforce training, and entrepreneurship support.');

  -- 6. NY Life Insurance
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'NY Life Insurance', 'vendor', 'Insurance and financial planning services.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'NY Life Insurance', 'Bill Cleare', 'WCLEARE@newyorklife.com', 'Financial Services & Insurance', 'Insurance and financial planning services.');

  -- 7. Queens Community House
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'Queens Community House', 'vendor', 'Social services, youth development, and workforce programs.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'Queens Community House', 'Dennis Redman', 'info@qchnyc.org', 'Community-Based Services', 'Social services, youth development, and workforce programs.');

  -- 8. Commonpoint Queens
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'Commonpoint Queens', 'vendor', 'Education, career training, and social services.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'Commonpoint Queens', 'H. Kwarteng', 'hkwarteng@commonpointqueens.org', 'Community Services & Workforce', 'Education, career training, and social services.');

  -- 9. Queens Chamber of Commerce
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'Queens Chamber of Commerce', 'vendor', 'Supports local businesses and entrepreneurship.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'Queens Chamber of Commerce', 'Jacqueline Donato', 'vocana@queenscp.org', 'Business & Economic Development', 'Supports local businesses and entrepreneurship.');

  -- 10. Queens Centers for Progress
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'Queens Centers for Progress', 'vendor', 'Supports individuals with developmental disabilities.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'Queens Centers for Progress', 'Valeria Ocana', 'jdonado@queenschamber.org', 'Disability Services & Employment', 'Supports individuals with developmental disabilities.');

  -- 11. Resorts World Casino NYC
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'Resorts World Casino NYC', 'vendor', 'Integrated resort and entertainment destination.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'Resorts World Casino NYC', 'Michelle Stoddart', 'michelle.stoddart@rwnewyork.com', 'Hospitality & Entertainment', 'Integrated resort and entertainment destination.');

  -- 12. NYC Dept. of Correction
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'NYC Dept. of Correction', 'vendor', 'Manages NYC jails and correctional facilities.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'NYC Dept. of Correction', 'Officer Rodriguez', 'Chrissdenice.Rodriguez-Arvelo@doc.nyc.gov', 'Government – Public Safety', 'Manages NYC jails and correctional facilities.');

  -- 13. NYS Dept. of Civil Service
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'NYS Dept. of Civil Service', 'vendor', 'State workforce and civil service administration.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'NYS Dept. of Civil Service', 'Carlotta Cecile', 'carlotta.cecile@cs.ny.gov', 'Government – Civil Service', 'State workforce and civil service administration.');

  -- 14. NYC Dept. of Veteran Services
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'NYC Dept. of Veteran Services', 'vendor', 'Connects veterans to benefits and careers.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'NYC Dept. of Veteran Services', 'Tanya Thomas', 'tthomas@veterans.nyc.gov', 'Government – Veterans Services', 'Connects veterans to benefits and careers.');

  -- 15. NYC Administration for Children’s Services
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'NYC Administration for Children’s Services', 'vendor', 'Protects and supports children and families.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'NYC Administration for Children’s Services', 'Glenys O''Neal', 'Glenys.Oneal@acs.nyc.gov', 'Government – Child & Family Services', 'Protects and supports children and families.');

  -- 16. Gamr
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'Gamr', 'vendor', 'Gamification and engagement platform for events.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'Gamr', 'Seyi Fakoya', 'seyi@gamr.world', 'AI & Gamification Platform', 'Gamification and engagement platform for events.');

  -- 17. Elmcor
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'Elmcor', 'vendor', 'Education, health, and workforce services.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'Elmcor', 'Joewyn Diaz', 'j.diaz@elmcor.org', 'Community & Workforce Development', 'Education, health, and workforce services.');

  -- 18. Greater Jamaica Development Corp / Greater Nexus
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'Greater Jamaica Development Corp / Greater Nexus', 'vendor', 'Business growth and innovation hub.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'Greater Jamaica Development Corp / Greater Nexus', 'Andrea Haynes', 'andrea@thegreaternexus.com', 'Economic Development & Innovation', 'Business growth and innovation hub.');

  -- 19. America Works
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'America Works', 'vendor', 'Job placement and training services.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'America Works', 'Matthew Silverstein', 'msilverstein@americaworks.com', 'Workforce Development', 'Job placement and training services.');

  -- 20. Express Employment Professionals
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'Express Employment Professionals', 'vendor', 'Temporary and permanent staffing.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'Express Employment Professionals', 'Greg Hughes', 'Greg.Hughes@ExpressPros.com', 'Staffing & Recruitment', 'Temporary and permanent staffing.');

  -- 21. AHRC
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'AHRC', 'vendor', 'Employment and community supports.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'AHRC', 'Michael Kaplan', 'Michael.Kaplan@ahrcnyc.org', 'Disability Services', 'Employment and community supports.');

  -- 22. WatchGuard 24/7
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'WatchGuard 24/7', 'vendor', 'Security and monitoring solutions.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'WatchGuard 24/7', 'Frances Velazquez', 'Fvelazquez@watchguard247.com', 'Security Services', 'Security and monitoring solutions.');

  -- 23. Office of Cannabis Management
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'Office of Cannabis Management', 'vendor', 'Regulates NY cannabis industry.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'Office of Cannabis Management', 'Shiela Wagner-Winfield', 'Sheila.Wagner-Winfield@ocm.ny.gov', 'Government – Cannabis Regulation', 'Regulates NY cannabis industry.');

  -- 24. L+M Development Partners
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'L+M Development Partners', 'vendor', 'Affordable and mixed-income housing developer.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'L+M Development Partners', 'Jerome Dunbar', 'jdunbar@lmdp.com', 'Real Estate Development', 'Affordable and mixed-income housing developer.');

  -- 25. NYC CCRB
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'NYC CCRB', 'vendor', 'Police oversight agency.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'NYC CCRB', 'LeShawn Lindsey', 'llindsey@ccrb.nyc.gov', 'Government – Oversight', 'Police oversight agency.');

  -- 26. US Department of Justice
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'US Department of Justice', 'vendor', 'Federal law enforcement and corrections.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'US Department of Justice', 'Michael LeGrand', 'clegrand@bop.gov', 'Federal Government', 'Federal law enforcement and corrections.');

  -- 27. Forest Hills Stadium
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'Forest Hills Stadium', 'vendor', 'Concert and event venue.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'Forest Hills Stadium', 'Emily Bartolomew', 'ebartholomew@bowerypresents.com', 'Live Entertainment', 'Concert and event venue.');

  -- 28. Queens Library
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'Queens Library', 'vendor', 'Public library system and digital access.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'Queens Library', 'Jin Hyun Bae', 'jinhyun.bae@queenslibrary.org', 'Libraries & Digital Literacy', 'Public library system and digital access.');

  -- 29. HipHop Gamer
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'HipHop Gamer', 'vendor', 'Gaming influencer and esports advocate.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'HipHop Gamer', 'Gerard Williams', 'hiphopgamer@hiphopgamer.net', 'Gaming & Esports', 'Gaming influencer and esports advocate.');

  -- 30. Pursuit
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'Pursuit', 'vendor', 'Software engineering training.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'Pursuit', 'Fraces Steele', 'frances@pursuit.org', 'Tech Workforce Training', 'Software engineering training.');

  -- 31. WERULE
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'WERULE', 'vendor', 'Mentorship and career pathways.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'WERULE', 'Camille Jalandoni', 'camille@we-rule.com', 'Mentorship & Workforce', 'Mentorship and career pathways.');

  -- 32. NY Power Authority
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'NY Power Authority', 'vendor', 'Nation’s largest public power organization.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'NY Power Authority', 'Tianna Tyler / Kevin Jusino', 'tianna.tyler@nypa.gov; kevin.jusino@nypa.gov', 'Clean Energy & Utilities', 'Nation’s largest public power organization.');

  -- 33. LIC Partnership
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'LIC Partnership', 'vendor', 'Business development in LIC.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'LIC Partnership', 'Charles Yu', 'cyu@licpartnership.org', 'Economic Development', 'Business development in LIC.');

  -- 34. Create Labs Ventures
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'Create Labs Ventures', 'vendor', 'AI-powered creative tools.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'Create Labs Ventures', 'Kanene Holder', 'kanene@createlabs.io', 'AI & Creative Tech', 'AI-powered creative tools.');

  -- 35. Jamaal Bowman Robotics / I.N.T. Robotics
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'Jamaal Bowman Robotics / I.N.T. Robotics', 'vendor', 'Robotics and engineering education.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'Jamaal Bowman Robotics / I.N.T. Robotics', 'Anas Abousalham', 'aabousalham@gmail.com', 'Robotics & STEM Education', 'Robotics and engineering education.');

  -- 36. All Star Code
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'All Star Code', 'vendor', 'Computer science programs for youth.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'All Star Code', 'Danny Rojas', 'danny@allstarcode.org', 'Tech Education', 'Computer science programs for youth.');

  -- 37. Drone Cadets
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'Drone Cadets', 'vendor', 'Drone piloting and STEM education.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'Drone Cadets', 'Tony Reid', 'tony@dronecadets.com', 'Aviation & Drone Training', 'Drone piloting and STEM education.');

  -- 38. AT&T
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'AT&T', 'vendor', 'Connectivity and wireless services.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'AT&T', 'Barbara Altieri', 'ba58292@att.com', 'Telecommunications', 'Connectivity and wireless services.');

  -- 39. Digital Girl, Inc.
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'Digital Girl, Inc.', 'vendor', 'Tech education for girls.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'Digital Girl, Inc.', 'Michelle Gall', 'mgall@digitalgirlinc.org', 'STEM Education', 'Tech education for girls.');

  -- 40. Future Forward Tech Meetups
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'Future Forward Tech Meetups', 'vendor', 'Meetups and networking.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'Future Forward Tech Meetups', 'Amaurys Valdez', 'me@amaurysvaldez.com', 'Tech Community', 'Meetups and networking.');

  -- 41. Dr. Ellis AI
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'Dr. Ellis AI', 'vendor', 'AI tools and consulting.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'Dr. Ellis AI', 'Pierre Côté', 'pierrecote1968@icloud.com', 'AI Consulting', 'AI tools and consulting.');

  -- 42. NYC FIRST (Tech)
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'NYC FIRST (Tech)', 'vendor', 'Robotics competitions and STEM.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'NYC FIRST (Tech)', 'Kate Karaeorgiou', 'kate@nycfirst.org', 'STEM Robotics Education', 'Robotics competitions and STEM.');

  -- 43. NYADI – New York Automotive Diesel
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'NYADI – New York Automotive Diesel', 'vendor', 'Automotive and diesel training.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'NYADI – New York Automotive Diesel', 'Lisa Chu', 'lchu@nyadi.edu', 'Technical Education', 'Automotive and diesel training.');

  -- 44. Willie Mae Rock Camp for Girls
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'Willie Mae Rock Camp for Girls', 'vendor', 'Music education and empowerment.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'Willie Mae Rock Camp for Girls', 'LaFrae Sci', 'lafrae@williemaerockcamp.org', 'Music & Youth Development', 'Music education and empowerment.');

  -- 45. NYSCI
  insert into public.stations (event_id, name, type, description) values (v_event_id, 'NYSCI', 'vendor', 'Hands-on science learning.') returning id into v_station_id;
  insert into public.vendors (station_id, name, primary_contact, email, industry_category, description) values (v_station_id, 'NYSCI', 'Frances Escano', 'fescano@nysci.org', 'Science Museum & STEM', 'Hands-on science learning.');

END $$;
