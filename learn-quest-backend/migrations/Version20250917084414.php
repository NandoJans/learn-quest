<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250917084414 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE lesson_registration (id INT AUTO_INCREMENT NOT NULL, lesson_id INT NOT NULL, user_id INT NOT NULL, course_registration_id INT NOT NULL, INDEX IDX_F58BA7C4CDF80196 (lesson_id), INDEX IDX_F58BA7C4A76ED395 (user_id), INDEX IDX_F58BA7C4A276B711 (course_registration_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE lesson_registration ADD CONSTRAINT FK_F58BA7C4CDF80196 FOREIGN KEY (lesson_id) REFERENCES lesson (id)');
        $this->addSql('ALTER TABLE lesson_registration ADD CONSTRAINT FK_F58BA7C4A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE lesson_registration ADD CONSTRAINT FK_F58BA7C4A276B711 FOREIGN KEY (course_registration_id) REFERENCES course_registration (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE lesson_registration DROP FOREIGN KEY FK_F58BA7C4CDF80196');
        $this->addSql('ALTER TABLE lesson_registration DROP FOREIGN KEY FK_F58BA7C4A76ED395');
        $this->addSql('ALTER TABLE lesson_registration DROP FOREIGN KEY FK_F58BA7C4A276B711');
        $this->addSql('DROP TABLE lesson_registration');
    }
}
