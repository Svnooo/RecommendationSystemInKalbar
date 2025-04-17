import { Card, Typography, Button } from "@material-tailwind/react";

export default function DestinasiCard({ title, image, description }) {
  return (
    <Card className="max-w-xs">
      <Card.Header as="img" src={image} alt={title} />
      <Card.Body>
        <Typography type="h6">{title}</Typography>
        <Typography className="my-1 text-foreground">{description}</Typography>
      </Card.Body>
      <Card.Footer>
        <Button>Explore</Button>
      </Card.Footer>
    </Card>
  );
}
