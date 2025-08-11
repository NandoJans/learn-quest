<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250729164647 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE course_registration (id INT AUTO_INCREMENT NOT NULL, course_id_id INT NOT NULL, user_id_id INT NOT NULL, INDEX IDX_E362DF5A96EF99BF (course_id_id), INDEX IDX_E362DF5A9D86650F (user_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE course_registration ADD CONSTRAINT FK_E362DF5A96EF99BF FOREIGN KEY (course_id_id) REFERENCES course (id)');
        $this->addSql('ALTER TABLE course_registration ADD CONSTRAINT FK_E362DF5A9D86650F FOREIGN KEY (user_id_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE lesson ADD CONSTRAINT FK_F87474F3591CC992 FOREIGN KEY (course_id) REFERENCES course (id)');
        $this->addSql('CREATE INDEX IDX_F87474F3591CC992 ON lesson (course_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE course_registration DROP FOREIGN KEY FK_E362DF5A96EF99BF');
        $this->addSql('ALTER TABLE course_registration DROP FOREIGN KEY FK_E362DF5A9D86650F');
        $this->addSql('DROP TABLE course_registration');
        $this->addSql('ALTER TABLE lesson DROP FOREIGN KEY FK_F87474F3591CC992');
        $this->addSql('DROP INDEX IDX_F87474F3591CC992 ON lesson');
    }
}
