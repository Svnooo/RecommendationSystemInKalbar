import React from "react";
import TestimonialCard from "../components/TestiCard";


const TestimonialSection = () => {
  const testimonials = [
    {
      avatar: "https://via.placeholder.com/150?text=User1",
      name: "John Doe",
      position: "CEO, Company A",
      testimonial:
        "This service is amazing! It helped our business grow by leaps and bounds.",
    },
    {
      avatar: "https://via.placeholder.com/150?text=User2",
      name: "Jane Smith",
      position: "Founder, Company B",
      testimonial:
        "I highly recommend this to anyone looking to improve their workflow. The team is top-notch!",
    },
    {
      avatar: "https://via.placeholder.com/150?text=User3",
      name: "Robert Johnson",
      position: "Marketing Director, Company C",
      testimonial:
        "A fantastic experience from start to finish. The quality of service exceeded my expectations.",
    },
    {
      avatar: "https://via.placeholder.com/150?text=User1",
      name: "John Doe",
      position: "CEO, Company A",
      testimonial:
        "This service is amazing! It helped our business grow by leaps and bounds.",
    },
    {
      avatar: "https://via.placeholder.com/150?text=User2",
      name: "Jane Smith",
      position: "Founder, Company B",
      testimonial:
        "I highly recommend this to anyone looking to improve their workflow. The team is top-notch!",
    },
    {
      avatar: "https://via.placeholder.com/150?text=User3",
      name: "Robert Johnson",
      position: "Marketing Director, Company C",
      testimonial:
        "A fantastic experience from start to finish. The quality of service exceeded my expectations.",
    },
  ];

  return (
    <div className="px-6 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={index}
            avatar={testimonial.avatar}
            name={testimonial.name}
            position={testimonial.position}
            testimonial={testimonial.testimonial}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialSection;
